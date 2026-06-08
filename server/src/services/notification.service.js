import Notification from "../models/Notification.js";
import { dateKey } from "../utils/time.js";

export async function createNotification(type, staff, message, date = dateKey()) {
  return Notification.create({ type, staff: staff?._id, message, date });
}

