export interface Post {
  _id: string;
  kind: string;
  title: string;
  description: string;
  price: number;
  adoptionFee: number;
  pet: {
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
  location: {
    state: string;
    suburb: string;
  };
  images: [
    {
      url: string;
    }
  ];
  childImages: [
    {
      url: string;
    }
  ];
  parentImages: [
    {
      url: string;
    }
  ];
  postedBy: string;
  likes: any[];
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
