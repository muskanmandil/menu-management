const Category = require('../models/Category')
const Subcategory = require('../models/Subcategory')
const Item = require('../models/Item');

exports.allItems = async (req, res) => {
    try {
        const items = await Item.find();
        return res.status(200).json({ items: items });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching items" });
    }
};

exports.getItems = async (req, res) => {
    const { name, category_name, subcategory_name } = req.query;

    if (name) {
        return getItemsByName(req, res);
    } else if (category_name) {
        return getItemsByCategory(req, res);
    } else if (subcategory_name) {
        return getItemsBySubcategory(req, res);
    } else {
        return res.status(400).json({ message: "Either name, category_name or subcategory_name is required" });
    }
}

const getItemsByName = async (req, res) => {
    try {

        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: "Item name is required" });
        }

        const item = await Item.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        return res.status(200).json({ item: item });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching item", error: err.message });

    }
}

const getItemsBySubcategory = async (req, res) => {
    try {
        const { subcategory_name } = req.query;

        const subcategoryExists = await Subcategory.find({name: subcategory_name});
        if (!subcategoryExists) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        const items = await Item.find({ subcategory_id: subcategoryExists[0]._id });

        return res.status(200).json({
            message: "Items fetched successfully",
            items: items
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error fetching items",
            error: err.message
        });

    }
}

const getItemsByCategory = async (req, res) => {
    try {
        const { category_name } = req.query;

        const categoryExists = await Category.find({name: category_name});
        if (!categoryExists) {
            return res.status(404).json({ message: "Category not found" });
        }

        const items = await Item.find({ category_id: categoryExists[0]._id });

        return res.status(200).json({
            message: "Items fetched successfully",
            items: items
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error fetching items",
            error: err.message
        });

    }
}

exports.createItem = async (req, res) => {
    try {
        const {
            category_id,
            subcategory_id,
            name,
            image,
            description,
            tax_applicable,
            tax,
            base_amount,
            discount
        } = req.body;

        if (!name || !base_amount) {
            return res.status(400).json({ message: "Missing required fields" });
        }


        if (category_id) {
            const category = await Category.findById(category_id);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }
        }

        if (subcategory_id) {
            const subcategory = await Subcategory.findById(subcategory_id);
            if (!subcategory) {
                return res.status(404).json({ message: "Subcategory not found" });
            }

            if (category_id && subcategory.category_id.toString() !== category_id) {
                return res.status(400).json({ message: "Subcategory does not belong to the specified category" });
            }
        }

        const existingItem = await Item.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });
        if (existingItem) {
            return res.status(409).json({ message: "Item with this name already exists" });
        }

        const calculatedDiscount = discount || 0;
        const total_amount = base_amount - calculatedDiscount;

        let finalTaxApplicability = tax_applicable;
        let finalTax;

        // If tax applicable not specified, check subcategory or category
        if (finalTaxApplicability === undefined) {
            if (subcategory_id) {
                const subcategory = await Subcategory.findById(subcategory_id);
                finalTaxApplicability = subcategory.tax_applicable;
                finalTax = subcategory.tax;
            } else if (category_id) {
                const category = await Category.findById(category_id);
                finalTaxApplicability = category.tax_applicable;
                finalTax = category.tax;
            }
        }

        const newItem = new Item({
            category_id,
            subcategory_id,
            name,
            image,
            description,
            tax_applicable: finalTaxApplicability,
            tax: finalTaxApplicability ? (tax || finalTax) : undefined,
            base_amount,
            discount: calculatedDiscount,
            total_amount
        });

        await newItem.save();

        return res.status(201).json({
            message: "Item created successfully",
            item: newItem
        });


    } catch (err) {

        console.error(err);
        return res.status(500).json({
            message: "Error creating item",
            error: err.message
        });


    }
}


exports.editItem = async (req, res) => {
    try {
        const { name } = req.params;
        const updateData = req.body;

        if (!name) {
            return res.status(400).json({ message: "Item name is required" });
        }

        const existingItem = await Item.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (!existingItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (updateData.category_id) {
            const category = await Category.findById(updateData.category_id);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }
        }

        if (updateData.subcategory_id) {
            const subcategory = await Subcategory.findById(updateData.subcategory_id);
            if (!subcategory) {
                return res.status(404).json({ message: "Subcategory not found" });
            }

            // If subcategory is provided, ensure it matches the category
            if (updateData.category_id &&
                subcategory.category_id.toString() !== updateData.category_id) {
                return res.status(400).json({ message: "Subcategory does not belong to the specified category" });
            }
        }

        if (updateData.name) {
            const itemWithSameName = await Item.findOne({
                name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
                _id: { $ne: existingItem._id }
            });
            if (itemWithSameName) {
                return res.status(409).json({ message: "Item name must be unique" });
            }
        }

        // Recalculate total amount if base_amount or discount is modified
        if (updateData.base_amount !== undefined || updateData.discount !== undefined) {
            const baseAmount = updateData.base_amount !== undefined
                ? updateData.base_amount
                : existingItem.base_amount;
            const discount = updateData.discount !== undefined
                ? updateData.discount
                : existingItem.discount;

            updateData.total_amount = baseAmount - discount;
        }


        if (updateData.tax_applicable === false) {
            updateData.tax = undefined;
        } else if (updateData.tax_applicable === true && updateData.tax === undefined) {
            return res.status(400).json({
                message: "Tax is required when tax is applicable"
            });
        }


        const updatedItem = await Item.findByIdAndUpdate(
            existingItem._id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Item updated successfully",
            item: updatedItem
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error updating item",
            error: err.message
        });

    }
}

exports.searchItems = async (req, res) => {
    try {
        const {
            name,           
            page = 1,       
            limit = 10,     
            category_id,    
            subcategory_id, 
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;

        const searchQuery = {};

        if (name) {
            searchQuery.name = {
                $regex: name,
                $options: 'i'
            };
        }

        if (category_id) {
            searchQuery.category_id = category_id;
        }

        if (subcategory_id) {
            searchQuery.subcategory_id = subcategory_id;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Pagination
        const pageNumber = parseInt(page);
        const itemsPerPage = parseInt(limit);
        const skip = (pageNumber - 1) * itemsPerPage;


        const items = await Item.find(searchQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(itemsPerPage)
            .populate('category_id', 'name')
            .populate('subcategory_id', 'name');

        const totalItems = await Item.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalItems / itemsPerPage);


        return res.status(200).json({
            message: "Items searched successfully",
            items: items,
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });


    } catch (err) {

        console.error(err);
        return res.status(500).json({
            message: "Error searching items",
            error: err.message
        });

    }
}