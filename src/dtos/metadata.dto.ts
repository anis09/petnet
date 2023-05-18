export class GetSuburbsReqDto {
  public zipCode: string;
}

export class GetSuburbsResDto {
  public state: string;
  public suburbs: string[];
}
export class GetSuburbsByStateReqDto {
  state: string;
}

export class GetSuburbsResByStateDto {
  public state: string;
  public suburbs: string[];
}
