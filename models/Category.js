const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        image: { type: String },
        description: { type: String },
        tax_applicable: { type: Boolean, required: true },
        tax: { type: Number, required: function () { return this.tax_applicable; } },
        tax_type: { type: String, enum: ['percentage', 'flat'], required: function () { return this.tax_applicable; } }
    }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
