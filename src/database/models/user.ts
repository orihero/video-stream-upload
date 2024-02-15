import { Schema, model } from "mongoose";

export interface IUser {
  name: string;
  phone: string;
  parentNumber: string;
  region: string;
  dateOfBirth: string;
  purchasedCourses: string[];
  pickedCourses: string[];
  affilateSource: string;
  progress: {
    courseId: String;
    classId: String;
    progress: {
      videoId: String;
      progress: Number | String;
      testResult: Number;
    }[];
  }[];
}

const userSchema = new Schema<Partial<IUser>>({
  dateOfBirth: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  parentNumber: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  region: {
    type: String,
    required: true,
  },
  purchasedCourses: {
    type: [String],
  },
  pickedCourses: {
    type: [String],
  },
  affilateSource: {
    type: String,
  },
  progress: {
    type: [
      {
        courseId: String,
        classId: String,
        progress: [
          { videoId: String, progress: Number, testResult: Number }, //in miliseconds
        ],
      },
    ],
  },
});

export const UserModel = model("User", userSchema);
