import React, { useState } from "react";

//components/category-filter.tsx
const categories = [
    "Beverages",
    "Egg, Meat & Fish",
    "Food Grains",
    "Fruits & Veggies",
    "Oil & Masala",
    "Snacks & Branded",
    "Kitchen & Garden",
    "Gourmet Food",
    "Baby Care",
    "Cleaning",
    "Beauty & Hygiene",
];

type CategoryFilterProps = {
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    selectedCategory,
    onCategoryChange,
}) => {
    return (
        <div>
            <h3>Categories</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                <li>
                    <button
                        onClick={() => onCategoryChange(null)}
                        style={{
                            fontWeight: selectedCategory === null ? "bold" : "normal",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 0",
                        }}
                    >
                        All
                    </button>
                </li>
                {categories.map((category) => (
                    <li key={category}>
                        <button
                            onClick={() => onCategoryChange(category)}
                            style={{
                                fontWeight: selectedCategory === category ? "bold" : "normal",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px 0",
                            }}
                        >
                            {category}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default function CategoryFilterContainer() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
        />
    );
}