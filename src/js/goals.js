// goals.js
import {
  getGoals as storageGetGoals,
  saveGoals as storageSaveGoals,
} from "./storage.js";

export function getGoals() {
  return storageGetGoals();
}

export function saveGoals(goals) {
  storageSaveGoals(goals);
}
