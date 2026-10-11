/**
 * Shared document shape for every module model.
 * `id` is the public identifier. Mongo's `_id` stays internal.
 */
export const schemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
};
