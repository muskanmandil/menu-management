const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
    {
        category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        name: { type: String, required: true },
        image: { type: String },
        description: { type: String },
        tax_applicable: { type: Boolean, default: null},
        tax: { type: Number, default: null},
    }
);

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
