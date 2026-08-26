import React from 'react';

const PageHeader = ({ category, title }) => {
    return (
        <div className="hidden md:flex items-center gap-2 mb-6 px-2 md:px-0">
            <span className="text-gray-500 text-sm font-medium">{category}</span>
            <span className="text-gray-600 text-sm font-medium">{'>'}</span>
            <h1 className="text-lg font-medium text-white">{title}</h1>
        </div>
    );
};

export default PageHeader;
