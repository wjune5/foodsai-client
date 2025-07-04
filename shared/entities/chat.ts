export type Message = {
    text: string;
    isUser: boolean;
    timestamp?: number;
    isError?: boolean;
};
  
export interface ChatResponse {
  content: string;
  userContentSufficient: boolean;
  systemAccurateEnough: boolean;
  systemAccurateRate: string;
  requestParams: ChatRequestParams;
}

export interface ChatRequestParams {
  model: string[];
  minExpirationDate: number | null;
  maxExpirationDate: number | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  cookingTime: number | null;
  ingredients: string[];
  nutrition: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  cuisine: string[];
  mealType: string[];
}

export interface ChatHistory {
  messages: Message[];
  chatRequestParams: ChatRequestParams;
  timestamp: number;
  isSufficient: boolean;
}

export interface FormValidation {
  isValid: boolean;
  errors: {
    location?: string;
    chat?: string;
    yearRange?: string;
    powerType?: string;
    bodyType?: string;
  };
}

export interface VehicleSearchStep2Errors {
  yearRange?: string;
  powerType?: string;
  bodyType?: string;
}

export interface VehicleSearchStep2Props {
  step2Errors: VehicleSearchStep2Errors;
  selectedPowerTypes: number[];
  handlePowerTypeClick: (typeId: number) => void;
  showMorePowerTypes: boolean;
  selectedBodyTypes: number[];
  handleBodyTypeClick: (typeId: number) => void;
  showMoreBodyTypes: boolean;
  onToggleMorePowerTypes: () => void;
  onToggleMoreBodyTypes: () => void;
}
