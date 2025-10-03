import React from 'react';

const blogPosts = [
    {
        id: 1,
        title: "5 Telltale Signs of a Deepfake Video",
        author: "Dr. Evelyn Reed",
        date: "October 26, 2023",
        excerpt: "As AI-generated video becomes more sophisticated, spotting fakes is harder than ever. We break down the subtle visual and audio cues that can help you identify a deepfake before you share it, from unnatural blinking patterns to audio-sync issues.",
        tags: ["AI", "Deepfake", "Media Literacy"],
    },
    {
        id: 2,
        title: "Cognitive Biases: How Your Own Mind Can Fool You",
        author: "Alex Chen",
        date: "October 18, 2023",
        excerpt: "Misinformation doesn't just spread because it's convincing; it also preys on our inherent mental shortcuts. Learn about confirmation bias, the backfire effect, and other cognitive traps that make us vulnerable to fake news.",
        tags: ["Psychology", "Misinformation", "Critical Thinking"],
    },
    {
        id: 3,
        title: "The Anatomy of a Phony News Site",
        author: "Maria Garcia",
        date: "October 05, 2023",
        excerpt: "Fake news websites are designed to look legitimate. This guide will walk you through a checklist of things to look for, including domain name tricks, lack of author credentials, sensationalist headlines, and the overuse of ad trackers.",
        tags: ["Fact-Checking", "Websites", "Security"],
    },
];


const BlogCard: React.FC<{ post: typeof blogPosts[0] }> = ({ post }) => (
    <div className="bg-light-surface/50 dark:bg-cyber-surface/60 border border-light-border dark:border-cyber-border/50 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:hover:shadow-cyber-cyan/10 hover:-translate-y-1">
        <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map(tag => (
                <span key={tag} className="text-xs font-bold uppercase tracking-wider bg-light-cyan/10 dark:bg-cyber-cyan/10 text-light-cyan dark:text-cyber-cyan px-2 py-1 rounded-full">{tag}</span>
            ))}
        </div>
        <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-2">{post.title}</h3>
        <p className="text-sm text-light-text-secondary dark:text-cyber-text-secondary mb-4">
            By {post.author} on {post.date}
        </p>
        <p className="text-base text-light-text-secondary dark:text-cyber-text-secondary leading-relaxed">
            {post.excerpt}
        </p>
        <button className="mt-6 font-bold text-light-cyan dark:text-cyber-cyan hover:underline">
            Read More &rarr;
        </button>
    </div>
);


const BlogPage: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in-up text-light-text dark:text-cyber-text">
            <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-bold text-light-cyan dark:text-cyber-cyan">Synthetica Insights</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-cyber-text-secondary">
                    Exploring the intersection of technology, truth, and digital media.
                </p>
            </div>

            <div className="space-y-12">
                {blogPosts.map(post => (
                    <BlogCard key={post.id} post={post} />
                ))}
            </div>
             <div className="text-center mt-16">
                <p className="text-light-text-secondary dark:text-cyber-text-secondary">More articles coming soon.</p>
            </div>
        </div>
    );
};

export default BlogPage;