// Simulated API for Blog Posts using localStorage
// This allows the blog features to work without a real backend for demonstration purposes.

const STORAGE_KEY = 'fydblock_blogs';

const INITIAL_BLOGS = [
    {
        id: 1,
        title: 'The Future of React: Server Components Explained',
        excerpt: 'Dive deep into React Server Components and how they are changing the way we build and optimize web applications for better performance.',
        content: `React Server Components (RSC) represent a paradigm shift in how we build React applications. Unlike traditional React components that run on the client, RSCs run solely on the server. This allows them to directly access backend resources like databases and file systems without needing an API layer in between.

### Why Server Components?

1. **Zero Bundle Size:** Dependencies used in Server Components are not included in the client bundle.
2. **Backend Access:** Directly query your database from your component.
3. **Automatic Code Splitting:** Client components imported by Server Components are automatically code-split.

This shift allows for faster initial page loads and a better developer experience, blurring the lines between backend and frontend development.`,
        category: 'Development',
        created_at: '2026-01-05T10:00:00Z',
        author: 'Alex Chen',
        read_time: '5 min read',
        image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80'
    },
    {
        id: 2,
        title: 'Minimalism in Digital Product Design',
        excerpt: 'Why less is more when it comes to user interface design. We discuss how to reduce cognitive load and improve user experience through minimalism.',
        content: `Minimalism isn't just about white space; it's about clarity. In digital product design, every element on the screen adds cognitive load to the user. By stripping away non-essential elements, we can guide the user's attention to what truly matters.

### Core Principles

*   **Negative Space:** Give elements room to breathe.
*   **Typography:** Use font size and weight to create hierarchy.
*   **Color:** Use color intentionally to guide action, not just for decoration.

When applying minimalism, ask yourself: "Does this element support the user's primary goal?" If not, consider removing it.`,
        category: 'Design',
        created_at: '2026-01-03T14:30:00Z',
        author: 'Emma Wilson',
        read_time: '6 min read',
        image_url: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80'
    },
    {
        id: 3,
        title: 'Understanding Color Theory for UI Designers',
        excerpt: 'A comprehensive guide to using color effectively in your user interfaces. Learn about color harmony, contrast, and accessibility.',
        content: `Color is one of the most powerful tools in a UI designer's toolkit. It evokes emotion, directs attention, and reinforces brand identity. However, using it effectively requires understanding the basics of color theory.

### Key Concepts

*   **Hue, Saturation, Value:** The three dimensions of color.
*   **Harmony Rules:** Monochromatic, Analogous, Complementary, Triadic.
*   **Accessibility:** Ensuring sufficient contrast for readability (WCAG guidelines).

Remember, 60-30-10 rule is a great starting point: 60% dominant color, 30% secondary color, and 10% accent color.`,
        category: 'Design',
        created_at: '2025-12-28T09:15:00Z',
        author: 'Marcus Johnson',
        read_time: '7 min read',
        image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80'
    },
    {
        id: 4,
        title: 'Building Scalable Design Systems',
        excerpt: 'Learn how to create consistent, maintainable, and scalable design systems that bridge the gap between design and engineering teams.',
        content: `A design system is more than just a component library; it's a shared language between designers and developers. It ensures consistency, speeds up development, and improves the overall quality of the product.

### Components of a Design System

1.  **Design Tokens:** The atomic values of your system (colors, spacing, typography).
2.  **Component Library:** Reusable UI elements (buttons, inputs, cards).
3.  **Documentation:** Guidelines on how and when to use components.

Start small, document everything, and treat your design system as a product itself.`,
        category: 'Design',
        created_at: '2026-01-07T11:00:00Z',
        author: 'Sarah Jenkins',
        read_time: '8 min read',
        image_url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80'
    }
];

// Helper to get blogs from storage
const getStoredBlogs = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BLOGS));
        return INITIAL_BLOGS;
    }
    return JSON.parse(stored);
};

export const fetchBlogs = async (category = 'All') => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const blogs = getStoredBlogs();

    if (category === 'All') {
        // Sort by date desc
        return blogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return blogs
        .filter(blog => blog.category === category)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const fetchBlogById = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const blogs = getStoredBlogs();
    const blog = blogs.find(b => b.id === parseInt(id) || b.id === id);
    if (!blog) throw new Error('Blog not found');
    return blog;
};

export const createBlog = async (blogData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const blogs = getStoredBlogs();
    const newBlog = {
        id: Date.now(), // simple ID generation
        ...blogData,
        created_at: new Date().toISOString()
    };

    const updatedBlogs = [newBlog, ...blogs];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBlogs));

    return newBlog;
};

export const deleteBlog = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const blogs = getStoredBlogs();
    const parsedId = parseInt(id) || id;
    const updatedBlogs = blogs.filter(b => b.id !== parsedId && b.id != id); // loose comparison for string numbers just in case

    if (blogs.length === updatedBlogs.length) {
        // Try finding it first to match behavior
        const exists = blogs.some(b => b.id == parsedId);
        if (!exists) throw new Error('Blog not found');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBlogs));
    return true;
};
