import { threadId } from "worker_threads";
import { errors } from "../constants/errors";
import {
  GetSuburbsByStateReqDto,
  GetSuburbsReqDto,
  GetSuburbsResByStateDto,
  GetSuburbsResDto,
} from "../dtos/metadata.dto";
import { HttpException } from "../middlewares/error.middleware";
import { suburbModel } from "../models/suburb.model";

class MetadataService {
  private suburbs = suburbModel;

  public async getSuburbs(input: GetSuburbsReqDto): Promise<GetSuburbsResDto> {
    const foundSuburbs: GetSuburbsResDto[] = await this.suburbs.aggregate([
      {
        $match: {
          postcode: parseInt(input.zipCode),
        },
      },
      {
        $group: {
          _id: "$postcode",
          state: {
            $first: "$state.name",
          },
          suburbs: {
            $push: "$name",
          },
        },
      },
    ]);

    if (!foundSuburbs || foundSuburbs.length === 0)
      throw new HttpException(404, errors.ZIP_CODE_NOT_FOUND);

    return {
      state: foundSuburbs[0].state,
      suburbs: foundSuburbs[0].suburbs,
    };
  }

  public async getSuburbsByState(
    input: GetSuburbsByStateReqDto
  ): Promise<GetSuburbsResDto> {
    const foundSuburbs: GetSuburbsResDto[] = await this.suburbs.aggregate([
      {
        $match: {
          "state.name": input.state,
        },
      },
      {
        $group: {
            _id: "$state.name",
          //   state: {
          //     $push: "$state.name",
          //   },

          suburbs: {
            $push: {
              postCode: "$postcode",
              name: "$name",
            },
          },
        },
      },
    ]);

    if (!foundSuburbs || foundSuburbs.length === 0)
      throw new HttpException(404, errors.ZIP_CODE_NOT_FOUND);

    return {
      state: foundSuburbs[0].state,
      suburbs: foundSuburbs[0].suburbs,
    };
  }
  public async getStates(): Promise<string[]> {
    let stateList: string[] = await this.suburbs
      .find({})
      .distinct("state.name");

    return stateList;
  }
}

export default MetadataService;
