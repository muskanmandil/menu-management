const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
        subcategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: false },
        name: { type: String, required: true },
        image: { type: String },
        description: { type: String },
        tax_applicable: { type: Boolean, required: false },
        tax: { type: Number, required: function () { return this.tax_applicable; } },
        base_amount: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        total_amount: {
            type: Number,
            required: true,
            default: function () { return this.base_amount - this.discount; }
        }
    }
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
