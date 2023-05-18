import axios from "axios";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import fetch from 'cross-fetch';
import FormData from "form-data";
import helmet from "helmet";
import hpp from "hpp";
import { connect } from "mongoose";
import morgan from "morgan";
import * as fs from 'fs';
import passport from "passport";
import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./../public/docs/swagger.json";
import { vars } from "./constants/vars";
import {
  SignInUserWithAppleReqDto,
  SignInUserWithAppleResDto,
  SignInUserWithFaceboookReqDto,
  SignInUserWithFaceboookResDto,
  SignInUserWithGoogleReqDto,
  SignInUserWithGoogleResDto,
} from "./dtos/auth.dto";
import { Routes } from "./interfaces/routes.interface";
import errorMiddleware from "./middlewares/error.middleware";
import AuthService from "./services/auth.service";
import { logger, stream } from "./utils/logger";
import io from "./utils/socket";

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const AppleStrategy = require('@nicokaiser/passport-apple').Strategy;

class App {
  public app: express.Application;

  constructor(routes: Routes[]) {
    this.app = express();

    this.app.use(express.static("public"));

    const options = {
      explorer: true,
      customSiteTitle: 'Petnet API',
      swaggerOptions: {
        urls: [
          {
            url: '/docs/app/swagger.json',
            name: 'Petnet App API V1'
          },
          {
            url: '/docs/dash/swagger.json',
            name: 'Petnet Dash API V1'
          }
        ]
      }
    }

    // this.app.use(
    //   "/api-docs",
    //   swaggerUi.serve,
    //   swaggerUi.setup(swaggerDocument, { explorer: true })
    // );

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, options));

    this.app.use(
      session({
        resave: false,
        saveUninitialized: true,
        secret: "SECRET",
      })
    );

    this.connectToMongoDB();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.initializePassport();
    this.authenticateGoogle();
    this.authenticateFacebook();
    this.authenticateApple();
  }

  public listen() {
    this.app.listen(vars.port, () => {
      logger.info(`=================================`);
      logger.info(`======== ENV: ${vars.env} ========`);
      logger.info(`🚀 App listening on the port ${vars.port}`);

      io.listen(vars.socketPort);
      logger.info(`Socket listening on the port ${vars.socketPort}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToMongoDB() {
    connect(vars.mongoUri);
  }

  private initializeMiddlewares() {
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(
      express.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
      })
    );
    this.app.use(compression());
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(hpp());
    this.app.use(morgan("dev", { stream }));
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializePassport() {
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    passport.serializeUser(function (user, cb) {
      cb(null, user);
    });

    passport.deserializeUser(function (obj, cb) {
      cb(null, obj);
    });
  }

  private authenticateGoogle() {
    let userProfile;
    passport.use(
      new GoogleStrategy(
        {
          clientID: vars.googleClientId,
          clientSecret: vars.googleClientSecret,
          callbackURL: `${vars.host}${vars.googleClientRedirectUrl}`
        },
        async (accessToken, _refreshToken, _profile, done) => {
          const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });
          const successResponse = await response.json();

          let picture;
          if (successResponse.picture) {
            const { data: stream } = await axios.get(successResponse.picture, {
              responseType: 'stream',
            });

            const formData = new FormData();
            formData.append('file', stream);
            const { data } = await axios.post(`${vars.host}/api/v1/upload/s3`, formData);
            if (data?.files?.length > 0) {
              picture = data?.files[0]?.url;
            }
          }
          userProfile = {
            id: successResponse.sub,
            email: successResponse.email,
            givenName: successResponse.given_name,
            familyName: successResponse.family_name,
            picture
          };
          return done(null, userProfile);
        }
      )
    );

    this.app.get(
      vars.googleClientAuthUrl,
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    this.app.get(
      vars.googleClientRedirectUrl,
      passport.authenticate("google", {
        failureRedirect: `${vars.appLink}${vars.googleErrorUrl}`,
      }),
      async function (req, res) {
        const inputData: SignInUserWithGoogleReqDto = {
          id: userProfile.id,
          email: userProfile.email,
          givenName: userProfile.givenName,
          familyName: userProfile.familyName,
          picture: userProfile.picture
        };

        const outputData: SignInUserWithGoogleResDto =
          await new AuthService().signInUserWithGoogle(inputData);
        if (outputData.lastSignIn) {
          res.redirect(
            `${vars.appLink}${vars.googleSuccessUrl}/${outputData.accessToken
            }/${outputData.userId}/${outputData.lastSignIn
              .trim()
              .toLowerCase()}`
          );
        } else {
          res.redirect(
            `${vars.appLink}${vars.googleSuccessUrl}/${outputData.accessToken}/${outputData.userId}`
          );
        }
      }
    );
  }

  private authenticateFacebook() {
    let userProfile;
    passport.use(
      new FacebookStrategy(
        {
          clientID: vars.facebookClientId,
          clientSecret: vars.facebookClientSecret,
          callbackURL: `${vars.host}${vars.facebookClientRedirectUrl}`
        },
        async (accessToken, _refreshToken, _profile, done) => {
          const response = await fetch(`https://graph.facebook.com/v2.10/me?access_token=${accessToken}&fields=id,email,first_name,last_name,picture.width(512).height(512)`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const successResponse = await response.json();

          let picture;
          if (successResponse.picture?.data?.url) {
            const { data: stream } = await axios.get(successResponse.picture?.data?.url, {
              responseType: 'stream',
            });

            const formData = new FormData();
            formData.append('file', stream);

            const { data } = await axios.post(`${vars.host}/api/v1/upload/s3`, formData);
            if (data?.files?.length > 0) {
              picture = data?.files[0]?.url;
            }
          }
          userProfile = {
            id: successResponse.id,
            email: successResponse.email,
            firstName: successResponse.first_name,
            lastName: successResponse.last_name,
            picture
          };
          return done(null, userProfile);
        }
      )
    );

    this.app.get(
      vars.facebookClientAuthUrl,
      passport.authenticate("facebook", { scope: "email" })
    );

    this.app.get(
      vars.facebookClientRedirectUrl,
      passport.authenticate("facebook", {
        failureRedirect: `${vars.appLink}${vars.facebookErrorUrl}`,
      }),
      async function (req, res) {
        const inputData: SignInUserWithFaceboookReqDto = {
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          picture: userProfile.picture,
        };

        const outputData: SignInUserWithFaceboookResDto =
          await new AuthService().signInUserWithFacebook(inputData);

        // res.redirect(
        //   `${vars.appLink}${vars.facebookSuccessUrl}/${outputData.accessToken}`
        // );
        if (outputData.lastSignIn) {
          res.redirect(
            `${vars.appLink}${vars.facebookSuccessUrl}/${outputData.accessToken
            }/${outputData.userId}/${outputData.lastSignIn
              .trim()
              .toLowerCase()}`
          );
        } else {
          res.redirect(
            `${vars.appLink}${vars.facebookSuccessUrl}/${outputData.accessToken}/${outputData.userId}`
          );
        }
      }
    );
  }

  private authenticateApple() {
    let userProfile;
    passport.use(
      new AppleStrategy(
        {
          clientID: vars.appleClientID,
          teamID: vars.appleTeamId,
          keyID: vars.appleKeyIdentifier,
          key: fs.readFileSync(vars.applePrivateKeyPath),
          callbackURL: `${vars.host}${vars.appleClientRedirectUrl}`,
          scope: ['name', 'email']
        },
        (accessToken, refreshToken, profile, done) => {
          const {
            id,
            name,
            email
          } = profile;

          userProfile = profile;
          return done(null, {
            id,
            email,
            name
          });
        }
      )
    );

    this.app.get(vars.appleClientAuthUrl, passport.authenticate("apple"));

    this.app.post(
      vars.appleClientRedirectUrl,
      passport.authenticate("apple", {
        failureRedirect: `${vars.appLink}${vars.appleErrorUrl}`,
      }),
      async function (req, res) {
        const inputData: SignInUserWithAppleReqDto = {
          id: userProfile.id,
          email: userProfile.email,
          name: {
            firstName: userProfile.name?.firstName,
            lastName: userProfile.name?.lastName
          }
        };

        const outputData: SignInUserWithAppleResDto =
          await new AuthService().signInUserWithApple(inputData);
        if (outputData.lastSignIn) {
          res.redirect(
            `${vars.appLink}${vars.appleSuccessUrl}/${outputData.accessToken
            }/${outputData.userId}/${outputData.lastSignIn
              .trim()
              .toLowerCase()}`
          );
        } else {
          res.redirect(
            `${vars.appLink}${vars.appleSuccessUrl}/${outputData.accessToken}/${outputData.userId}`
          );
        }
      }
    );
  }
}

export default App;
