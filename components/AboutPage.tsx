import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in-up text-light-text dark:text-cyber-text">
            <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-bold text-light-cyan dark:text-cyber-cyan">About Synthetica</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-cyber-text-secondary">
                    Empowering you with the clarity to navigate the digital world.
                </p>
            </div>

            <div className="space-y-10 text-lg leading-relaxed text-light-text-secondary dark:text-cyber-text-secondary">
                <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">Our Mission</h3>
                    <p>
                        In an age of information overload, distinguishing fact from fiction has never been more challenging or more critical. Synthetica was born from a desire to combat the rising tide of misinformation. Our mission is to provide an accessible, intelligent, and reliable tool that empowers individuals to verify the authenticity of news articles, images, and online content, fostering a more informed and discerning public discourse.
                    </p>
                </section>

                <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">The Technology Behind Clarity</h3>
                    <p>
                        Synthetica stands at the forefront of verification technology, powered by Google's state-of-the-art <span className="font-bold text-light-cyan dark:text-cyber-cyan">Gemini</span> model. This advanced neural network allows us to perform multi-layered analysis that goes beyond simple keyword matching. We conduct semantic analysis, cross-reference claims with a vast index of trusted sources, and scrutinize images for tell-tale signs of AI generation or digital manipulation. This sophisticated approach ensures a nuanced and comprehensive verdict on the content you analyze.
                    </p>
                </section>
                
                <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">How It Works</h3>
                     <ul className="list-disc list-inside space-y-2">
                        <li><span className="font-semibold text-light-text dark:text-cyber-text">Text & URL Analysis:</span> Paste text or a URL, and our AI fact-checks claims, analyzes linguistic patterns for bias, and verifies sources to provide a confidence score and a detailed report.</li>
                        <li><span className="font-semibold text-light-text dark:text-cyber-text">Image Forensics:</span> Upload an image, and our system scans for inconsistencies in lighting, shadows, and textures, along with artifacts common to AI-generated content.</li>
                     </ul>
                </section>

                <section>
                    <h3 className="text-2xl font-bold text-light-text dark:text-cyber-text mb-3">Our Commitment to You</h3>
                    <p>
                        We are committed to transparency, user privacy, and continuous improvement. Synthetica is a tool designed to aid your critical thinking, not replace it. We believe that by providing a clear, data-driven second opinion, we can help you make better decisions about the information you consume and share. Your trust is our most important asset, and we are dedicated to maintaining the integrity and reliability of our platform.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
