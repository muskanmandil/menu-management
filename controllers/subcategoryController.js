const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

exports.allSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find();
        return res.status(200).json({ subcategories: subcategories });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching subcategories" });
    }
};

exports.getSubcategory = async (req, res) => {
    const { name, category_name } = req.query;

    if (name) {
        return getSubcategoryByName(req, res);
    } else if (category_name) {
        return getSubcategoryByCategory(req, res);
    } else {
        return res.status(400).json({ message: "Either name or category_name is required" });
    }
}


const getSubcategoryByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: "Subcategory name is required" });
        }

        const subcategory = await Subcategory.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        return res.status(200).json({ subcategory: subcategory });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching subcategory", error: err.message });

    }
}

const getSubcategoryByCategory = async (req, res) => {
    try {
        const { category_name } = req.query;

        const categoryExists = await Category.find({name: category_name});

        if (!categoryExists) {
            return res.status(404).json({ message: "Category not found" });
        }

        const subcategories = await Subcategory.find({ category_id: categoryExists[0]._id});
        if (subcategories.length === 0) {
            return res.status(404).json({ message: "No subcategories found for this category" });
        }
        
        return res.status(200).json({
            message: "Subcategories fetched successfully",
            subcategories: subcategories
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error fetching subcategories",
            error: err.message
        });

    }
}

exports.createSubcategory = async (req, res) => {
    try {
        const {
            category_id,
            name,
            image,
            description,
            tax_applicable,
            tax
        } = req.body;

        if (!category_id || !name ) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const category = await Category.findById(category_id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const existingSubcategory = await Subcategory.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            category_id: category_id
        });
        if (existingSubcategory) {
            return res.status(409).json({ message: "Subcategory with this name already exists in the category" });
        }

        let finalTaxApplicability = tax_applicable;
        let finalTax = tax;

        // If tax applicable not specified, use category's
        if (finalTaxApplicability === undefined) {
            finalTaxApplicability = category.tax_applicable;
        }

        // If tax not specified, use category's tax
        if (finalTax === undefined && finalTaxApplicability) {
            finalTax = category.tax;
        }

        const newSubcategory = new Subcategory({
            category_id,
            name,
            image,
            description,
            tax_applicable: finalTaxApplicability,
            tax: finalTaxApplicability ? finalTax : null
        });

        await newSubcategory.save();

        return res.status(201).json({
            message: "Subcategory created successfully",
            subcategory: newSubcategory
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error creating subcategory",
            error: err.message
        });
    }

}


exports.editSubcategory = async (req, res) => {
    try {
        const { name } = req.params;
        const updateData = req.body;

        if (!name) {
            return res.status(400).json({ message: "Subcategory name is required" });
        }

        const existingSubcategory = await Subcategory.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (!existingSubcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        // If changing category, validate new category
        if (updateData.category_id) {
            const categoryExists = await Category.findById(updateData.category_id);
            if (!categoryExists) {
                return res.status(404).json({ message: "New category not found" });
            }
        }

        if (updateData.name) {
            const subcategoryWithSameName = await Subcategory.findOne({
                name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
                category_id: existingSubcategory.category_id,
                _id: { $ne: existingSubcategory._id }
            });
            if (subcategoryWithSameName) {
                return res.status(409).json({ message: "Subcategory name must be unique within the category" });
            }
        }

        if (updateData.tax_applicable === false) {
            updateData.tax = null;
        } else if (updateData.tax_applicable === true) {
            if (updateData.tax === undefined) {
                return res.status(400).json({
                    message: "Tax is required when tax is applicable"
                });
            }
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            existingSubcategory._id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Subcategory updated successfully",
            subcategory: updatedSubcategory
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error updating subcategory",
            error: err.message
        });

    }
}