const Category = require('../models/Category');

exports.allCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ categories: categories });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching categories", error: err.message });
    }
};

exports.getCategoryByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const category = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json({ category: category });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching category", error: err.message });

    }
}

exports.createCategory = async (req, res) => {
    try {

        const {
            name,
            image,
            description,
            tax_applicable,
            tax,
            tax_type
        } = req.body;

        if (!name || tax_applicable === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });
        if (existingCategory) {
            return res.status(409).json({ message: "Category with this name already exists" });
        }

        if (tax_applicable) {
            if (!tax || !tax_type) {
                return res.status(400).json({
                    message: "Tax and tax type are required when tax is applicable"
                });
            }

            if (!['percentage', 'flat'].includes(tax_type)) {
                return res.status(400).json({
                    message: "Invalid tax type. Must be 'percentage' or 'flat'"
                });
            }
        }

        const newCategory = new Category({
            name,
            image,
            description,
            tax_applicable,
            tax: tax_applicable ? tax : undefined,
            tax_type: tax_applicable ? tax_type : undefined
        });

        await newCategory.save();

        return res.status(201).json({
            message: "Category created successfully",
            category: newCategory
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error creating category",
            error: err.message
        });

    }

}

exports.editCategory = async (req, res) => {
    try {
        const { name } = req.params;
        const updateData = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }


        if (updateData.name) {
            const categoryWithSameName = await Category.findOne({
                name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
                _id: { $ne: existingCategory._id }
            });
            if (categoryWithSameName) {
                return res.status(409).json({ message: "Category name must be unique" });
            }
        }


        if (updateData.tax_applicable === false) {
            updateData.tax = undefined;
            updateData.tax_type = undefined;
        } else if (updateData.tax_applicable === true) {
            if (!updateData.tax || !updateData.tax_type) {
                return res.status(400).json({
                    message: "Tax and tax type are required when tax is applicable"
                });
            }

            if (!['percentage', 'flat'].includes(updateData.tax_type)) {
                return res.status(400).json({
                    message: "Invalid tax type. Must be 'percentage' or 'flat'"
                });
            }
        }


        const updatedCategory = await Category.findByIdAndUpdate(
            existingCategory._id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Category updated successfully",
            category: updatedCategory
        });


    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error updating category",
            error: err.message
        });

    }
}

