export const About = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        About AgistMe
      </h1>
      <div className="prose dark:prose-invert">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          AgistMe is a modern web application built with React and TypeScript, designed to help users manage and organize information effectively.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Key Features
        </h2>
        <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
          <li>Modern, responsive design with dark mode support</li>
          <li>Secure authentication powered by Clerk</li>
          <li>Built with React, TypeScript, and Tailwind CSS</li>
          <li>State management using Zustand</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Technology Stack
        </h2>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
          <li>React with TypeScript</li>
          <li>Tailwind CSS for styling</li>
          <li>Clerk for authentication</li>
          <li>Zustand for state management</li>
          <li>React Router for navigation</li>
        </ul>
      </div>
    </div>
  );
};
