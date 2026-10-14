// Models mirror the backend source (controllers + mongoose models). Keep in sync with the API map.

export type UserRole = 'user' | 'chef';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  /** Only present once the backend returns bearer tokens (see compatibility report). */
  token?: string;
}

export interface ApiErrorBody {
  message?: string;
  success?: boolean;
  details?: unknown;
}

/** Catalog recipe: GET /food/get-all */
export interface CatalogFood {
  _id: string;
  foodName: string;
  ingredients: string[];
  precautions: string;
  description: string;
  foodImage: string;
  chef?: { username?: string } | string;
  createdAt: string;
}

export interface FoodListResponse {
  message: string;
  foods: CatalogFood[];
}

/** AI recipe body shared by protein and recreate results. */
export interface AiRecipe {
  recipeName?: string;
  newFoodName?: string;
  description?: string;
  originalFood?: string;
  addedIngredients?: string[];
  ingredients: string[];
  servings?: number | null;
  preparationTime?: string;
  instructions: string[];
  proteinSources?: string[];
  proteinPerServing?: string;
  caloriesPerServing?: string;
  medicalConsiderations?: string[];
}

/** AI generation record: POST /ai-service/amzingFood */
export interface ProteinHistoryItem {
  _id: string;
  ingredient: string[];
  numberofperson: number;
  anyMedical?: string;
  recipe: AiRecipe;
  queuePosition: number;
  createdAt: string;
  historyType?: 'protein_recipe';
}

/** Recreate record: POST /ai-service/amzeFood/recreate */
export interface RecreateHistoryItem {
  _id: string;
  existingFoodname: string;
  AddOnIngredient: string[];
  recipe: AiRecipe;
  queuePosition: number;
  createdAt: string;
  historyType?: 'recreated_food';
}

export type HistoryItem = ProteinHistoryItem | RecreateHistoryItem;

export interface HistoryListResponse {
  success: boolean;
  count: number;
  data: HistoryItem[];
}

export interface Profile {
  _id: string;
  fullName?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  SocialMedia?: string[];
  profession?: string;
  hobbies?: string[];
  bio?: string;
}

export interface NotificationItem {
  _id: string;
  message?: string;
  title?: string;
  isRead?: boolean;
  createdAt: string;
}
