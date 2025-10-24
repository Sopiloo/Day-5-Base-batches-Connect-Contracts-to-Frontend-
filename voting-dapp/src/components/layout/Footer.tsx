const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} DecentraVote. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-400">
            Built on{' '}
            <a
              href="https://base.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Base
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
