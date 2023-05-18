import { expect } from "chai";
import request from "supertest";
import {
  randEmail,
  randFirstName,
  randFullName,
  randLastName,
  randPassword,
  randState,
  randTodo,
  randZipCode,
} from "@ngneat/falso";
import { app } from "../server";

let BASE_URL = "http://localhost:8080/api/v1";

describe("Testing user authentification", () => {
  it("should register user", async () => {
    let newUser = {
      email: randEmail(),
      password: randPassword(),
      firstName: randFirstName(),
      lastName: randLastName(),
      state: randState(),
      suburb: randTodo().title,
      zipCode: Number(randZipCode().replace("-", "")),
    };
    let response = await request(app.getServer())
      .post(`${BASE_URL}/auth/sign-up`)
      .send(newUser);
  });
});
