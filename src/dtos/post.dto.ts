import "reflect-metadata";
import { Type } from "class-transformer";
import {
  IsDefined,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Post } from "interfaces/models/post.model.interface";
import { User } from "interfaces/models/user.model.interface";

class PetDto {
  @IsDefined()
  @IsIn(["CAT", "DOG"])
  public petType: string;

  @IsOptional()
  public microshipId: string;

  @IsOptional()
  public name: string;

  @IsOptional()
  public breed: string;

  @IsOptional()
  public dadBreed: string;

  @IsOptional()
  public momBreed: string;

  @IsOptional()
  public sex: string;

  @IsOptional()
  public isDesexed: boolean;

  @IsOptional()
  public age: string;

  @IsOptional()
  public size: string;

  @IsOptional()
  public veterinaryChecked: boolean;

  @IsOptional()
  public isVaccinated: boolean;

  @IsOptional()
  public coatLength: string;

  @IsOptional()
  public color: string;

  @IsOptional()
  public isInShelter: boolean;

  @IsOptional()
  public care: string;

  @IsOptional()
  public expectedAdultSize: string;

  @IsOptional()
  public goodWith: string;
}

class LocationDto {
  @IsOptional()
  public state: string;

  @IsOptional()
  public suburb: string;
}

export class CreatePostReqDto {
  @IsDefined()
  @IsIn(["STANDARD", "BREEDER"])
  public kind: string;

  @IsDefined()
  public title: string;

  @IsDefined()
  public description: string;

  @IsOptional()
  public price: number;

  @IsOptional()
  public adoptionFee: number;

  @IsObject()
  @ValidateNested()
  @Type(() => PetDto)
  public pet: PetDto;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  public location: LocationDto;

  @IsOptional()
  public images: [
    {
      url: string;
    }
  ];

  @IsOptional()
  public childImages: [
    {
      url: string;
    }
  ];

  @IsOptional()
  public parentImages: [
    {
      url: string;
    }
  ];
}

export class CreatePostResDto {
  public success: boolean;
  public createdPostId: string;
}
export class UpdatePostResDto {
  public success: boolean;
}

export class DeletePostResDto {
  public success: boolean;
}

export class GetPostsReqDto {
  @IsDefined()
  public pageNumber: string;

  @IsDefined()
  public pageSize: string;

  @IsOptional()
  public postedBy: string;

  @IsDefined()
  @IsIn(["RECENTLY_ADDED", "MOST_VIEWED"])
  public filter: string;

  @IsOptional()
  @IsIn(["CAT", "DOG"])
  public petType: string;

  @IsOptional()
  public petAge: string;

  @IsOptional()
  public petSize: string;

  @IsOptional()
  public petExpectedAdultSize: string;

  @IsOptional()
  public petVeterinaryChecked: number;

  @IsOptional()
  public petSex: string;

  @IsOptional()
  public petGoodWith: string;

  @IsOptional()
  public petCoatLength: string;

  @IsOptional()
  public petCare: string;

  @IsOptional()
  public petIsInShelter: number;

  @IsOptional()
  public search: string;

  @IsOptional()
  public state: string;

  @IsOptional()
  @IsMongoId()
  public userId: string;
}

export class PostDto {
  public postId: string;
  public kind: string;
  public title: string;
  public description: string;
  public price: number;
  public adoptionFee: number;
  public pet: {
    petType: string;
    microshipId: string;
    name: string;
    breed: string;
    dadBreed: string;
    momBreed: string;
    sex: string;
    isDesexed: boolean;
    age: string;
    size: string;
    veterinaryChecked: boolean;
    isVaccinated: boolean;
    coatLength: string;
    color: string;
    isInShelter: boolean;
    care: string;
    expectedAdultSize: string;
    goodWith: string;
  };
  public location: {
    state: string;
    suburb: string;
    latitude: number;
    longitude: number;
  };
  public images: [
    {
      url: string;
    }
  ];
  public childImages: [
    {
      url: string;
    }
  ];
  public parentImages: [
    {
      url: string;
    }
  ];
  public postedBy: {
    userId: string;
    kind: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
    suburb: string;
    zipCode: number;
    avatarUrl: string;
    breederPrefix: string;
    breederBio: string;
  };
  public createdAt: Date;
  public updatedAt: Date;
}

export class PostV2Dto {
  public postId: string;
  public kind: string;
  public title: string;
  public adoptionFee: number;
  public breed: string;
  public dadBreed: string;
  public momBreed: string;
  public location: {
    state: string;
    suburb: string;
  };
  public images: [
    {
      url: string;
    }
  ];
  public childImages: [
    {
      url: string;
    }
  ];
  public isLiked: boolean;
  public createdAt: Date;
}

export class GetPostsResDto {
  public total: number;
  public posts: PostDto[];
}
export class countPostsByStateResDto {
  _id: string;
  count: number;
}
export class countPostbyUserTypeDto {
  count: number;
}
export class GetPostsV2ResDto {
  public total: number;
  public posts: PostV2Dto[];
}

export class GetPostOwnerResDto {
  public success: boolean;
  public owner: User;
}
export class GetAllPetsResDto {
  public success: boolean;
  public pets: PetDto[];
}
///updates DTO's are going here
class UpdatePetDto {
  @IsOptional()
  @IsIn(["CAT", "DOG"])
  public petType?: string;

  @IsOptional()
  public microshipId?: string;

  @IsOptional()
  public name?: string;

  @IsOptional()
  public breed?: string;

  @IsOptional()
  public dadBreed?: string;

  @IsOptional()
  public momBreed?: string;

  @IsOptional()
  public sex?: string;

  @IsOptional()
  public isDesexed?: boolean;

  @IsOptional()
  public age?: string;

  @IsOptional()
  public size?: string;

  @IsOptional()
  public veterinaryChecked?: boolean;

  @IsOptional()
  public isVaccinated?: boolean;

  @IsOptional()
  public coatLength?: string;

  @IsOptional()
  public color?: string;

  @IsOptional()
  public isInShelter?: boolean;

  @IsOptional()
  public care?: string;

  @IsOptional()
  public expectedAdultSize?: string;

  @IsOptional()
  public goodWith?: string;
}

class UpdateLocationDto {
  @IsOptional()
  public state?: string;

  @IsOptional()
  public suburb?: string;
}

export class UpdatePostReqDto {
  @IsOptional()
  public title?: string;

  @IsOptional()
  public description?: string;

  @IsOptional()
  public price?: number;

  @IsOptional()
  public adoptionFee?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdatePetDto)
  public pet?: UpdatePetDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateLocationDto)
  public location?: UpdateLocationDto;

  @IsOptional()
  public images?: [
    {
      url: string;
    }
  ];

  @IsOptional()
  public childImages?: [
    {
      url: string;
    }
  ];

  @IsOptional()
  public parentImages?: [
    {
      url: string;
    }
  ];
}
// Delete and Fetch by ID Dto's

export class GetPostByUserReqDto {
  userId: string;
}

export class DeletePostReqDto {
  postId: string;
}

export class GetPostByIdReqDto {
  postId: string;
}

export class GetPostByIdResDto {
  success: boolean;
  post: any;
}

export class GetPetInfoByIdResDto {
  success: boolean;
  pet: PetDto;
}
export class GetPostImgByIdResDto {
  success: boolean;
  imgs: [{ url: string }];
}
export class GetFavPostsByUserReqDto {
  postId: string;
}

export class GetFavPostsByUserResDto {
  success: boolean;
  posts: Post[];
}
export class CountPostByUserResDto {
  success: boolean;
  count: number;
}

export class FavoritePostReqDto {
  postId: string;
}
export class FavoritePostResDto {
  success: boolean;
}
export class CountByMonthDto {
  month: number;
  count: number;
}
export class CountByWeekDto {
  week: number;
  count: number;
}
export class CountByYearDto {
  _id: number;
  count: number;
}
export class CountPostByDate {
  success: boolean;
  countOutput: CountByMonthDto[] | CountByWeekDto[] | CountByYearDto[];
}
