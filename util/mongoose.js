module.exports = {
    multipleMongooseToObject: function (mongooseArray) {
      return mongooseArray.map((mongoose) => mongoose.toObject());
    },
    mongoosesToObject: function (mongooses) {
      return mongooses ? mongooses.toObject() : mongooses;
    },
  };