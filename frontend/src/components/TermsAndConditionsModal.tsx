import { useState } from 'react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  userRole: 'legal' | 'public';
}

export default function TermsAndConditionsModal({
  isOpen,
  onClose,
  onAccept,
  userRole,
}: TermsAndConditionsModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-black/80 border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col backdrop-blur-lg">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            Terms and Conditions
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Please read and agree to our terms before proceeding
          </p>
        </div>

        <div
          className="p-6 overflow-y-auto flex-1 text-gray-300"
          onScroll={handleScroll}
        >
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">About CaseCanopy</h3>
              <p className="text-gray-300">
                CaseCanopy is a comprehensive legal research and case management platform designed to facilitate access to justice across all legal domains. Our platform serves both legal professionals and the general public, providing tools and resources for legal research, case tracking, and legal document management across various practice areas including civil, criminal, corporate, family, intellectual property, and more.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Platform Purpose</h3>
              <p className="text-gray-300">
                Our mission is to democratize access to legal information and streamline legal processes across all practice areas. We provide:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-300">
                <li>Comprehensive legal research tools covering all legal domains</li>
                <li>Case management and tracking systems for various practice areas</li>
                <li>Legal document templates and resources across different specialties</li>
                <li>Platform for legal professionals to connect and share expertise</li>
                <li>Access to case law, statutes, and legal resources across jurisdictions</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">User Responsibilities</h3>
              <p className="text-gray-300">
                As a user of CaseCanopy, you agree to:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-300">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the confidentiality of your account</li>
                <li>Use the platform in accordance with applicable laws</li>
                <li>Respect the privacy and rights of other users</li>
                <li>Use the platform&apos;s resources responsibly and ethically</li>
              </ul>
            </section>

            {userRole === 'legal' && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-2">Legal Professional Requirements</h3>
                <p className="text-gray-300">
                  As a legal professional on our platform, you must:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-300">
                  <li>Provide valid professional credentials</li>
                  <li>Maintain professional standards and ethics</li>
                  <li>Ensure accurate representation of your qualifications and practice areas</li>
                  <li>Comply with all applicable legal and professional regulations</li>
                  <li>Share knowledge and resources responsibly within your expertise</li>
                </ul>
              </section>
            )}

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Privacy and Data Protection</h3>
              <p className="text-gray-300">
                We are committed to protecting your privacy and handling your data securely. All information provided through our platform is protected in accordance with applicable data protection laws and our privacy policy. This includes sensitive legal information and case-related data across all practice areas.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">Disclaimer</h3>
              <p className="text-gray-300">
                CaseCanopy provides comprehensive legal analysis, historical case research, and predictive insights across all legal domains. Our platform analyzes cases, identifies patterns, and offers predictions based on historical data and legal precedents. While we provide these valuable insights and research tools, we strongly encourage users to consult with qualified legal professionals for specific legal advice and representation. Our analysis and predictions are meant to supplement, not replace, professional legal counsel.
              </p>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-white/10 hover:border-white/30 rounded-xl transition-colors duration-200"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!hasScrolled}
              className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200 ${
                hasScrolled
                  ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
              }`}
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 