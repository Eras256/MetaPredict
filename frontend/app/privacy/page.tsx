'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="outline" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <GlassCard className="p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            <p>Last Updated: December 15, 2025</p>
            <p>Effective Date: December 15, 2025</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-400" />
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                MetaPredict.fun ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our decentralized 
                prediction market platform ("Platform").
              </p>
              <p className="leading-relaxed mt-4">
                Please read this Privacy Policy carefully. By using the Platform, you consent to the data practices 
                described in this policy. If you do not agree with the practices described in this policy, you should 
                not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-green-400" />
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-white mt-4 mb-2">2.1 Blockchain Data</h3>
              <p className="leading-relaxed">
                As a decentralized platform built on blockchain technology, certain information is inherently public 
                and immutable:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Wallet Addresses:</strong> Your blockchain wallet address is publicly visible on the 
                    blockchain and may be associated with your Platform activity</li>
                <li><strong>Transaction History:</strong> All transactions, including bets, market creation, and 
                    resolution activities, are recorded on the blockchain and publicly accessible</li>
                <li><strong>Smart Contract Interactions:</strong> Your interactions with Platform smart contracts are 
                    publicly recorded</li>
                <li><strong>Market Participation:</strong> Your participation in prediction markets, including positions 
                    and outcomes, is visible on-chain</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">2.2 Information You Provide</h3>
              <p className="leading-relaxed">
                We may collect information that you voluntarily provide:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Contact information (if you contact us via email, social media, or other channels)</li>
                <li>Feedback, questions, or support requests</li>
                <li>Market creation information (market questions, descriptions, resolution criteria)</li>
                <li>Dispute submissions and evidence</li>
                <li>DAO governance proposals and votes</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">2.3 Automatically Collected Information</h3>
              <p className="leading-relaxed">
                When you use the Platform, we may automatically collect:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Usage Data:</strong> Information about how you interact with the Platform, including 
                    pages visited, features used, and time spent</li>
                <li><strong>Device Information:</strong> Browser type, device type, operating system, and IP address</li>
                <li><strong>Log Data:</strong> Server logs, error reports, and diagnostic information</li>
                <li><strong>Cookies and Tracking Technologies:</strong> See Section 6 for details</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">2.4 Third-Party Services</h3>
              <p className="leading-relaxed">
                We integrate with third-party services that may collect information:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Blockchain Networks:</strong> opBNB Testnet records all transactions publicly</li>
                <li><strong>AI Providers:</strong> Gemini, Llama, Mistral AI may process market data for oracle 
                    resolution</li>
                <li><strong>Chainlink:</strong> Provides price feeds and data streams</li>
                <li><strong>Wallet Providers:</strong> MetaMask, WalletConnect, and other wallet extensions may 
                    collect usage data</li>
                <li><strong>Analytics Services:</strong> We may use analytics tools to understand Platform usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-400" />
                3. How We Use Your Information
              </h2>
              <p className="leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Platform Operation:</strong> To provide, maintain, and improve the Platform's 
                    functionality</li>
                <li><strong>Market Resolution:</strong> To process market resolutions using AI oracles and DAO 
                    governance</li>
                <li><strong>User Support:</strong> To respond to your inquiries, provide customer support, and 
                    address technical issues</li>
                <li><strong>Security:</strong> To detect, prevent, and address fraud, security breaches, and other 
                    harmful activities</li>
                <li><strong>Compliance:</strong> To comply with legal obligations, enforce our Terms of Service, and 
                    protect our rights</li>
                <li><strong>Analytics:</strong> To analyze Platform usage, improve user experience, and develop new 
                    features</li>
                <li><strong>Communication:</strong> To send you important updates, security alerts, and administrative 
                    messages</li>
                <li><strong>Research:</strong> To conduct research and analysis on prediction markets and blockchain 
                    technology (using anonymized data)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
              <p className="leading-relaxed">
                We do not sell your personal information. We may share your information in the following 
                circumstances:
              </p>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">4.1 Public Blockchain Data</h3>
              <p className="leading-relaxed">
                Information recorded on the blockchain is publicly accessible and cannot be deleted or modified. 
                This includes wallet addresses, transactions, and smart contract interactions.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">4.2 Service Providers</h3>
              <p className="leading-relaxed">
                We may share information with third-party service providers who perform services on our behalf:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Cloud hosting and infrastructure providers</li>
                <li>AI model providers (Gemini, Llama, Mistral)</li>
                <li>Blockchain infrastructure providers</li>
                <li>Analytics and monitoring services</li>
                <li>Customer support platforms</li>
              </ul>
              <p className="leading-relaxed mt-4">
                These service providers are contractually obligated to protect your information and use it only for 
                the purposes we specify.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">4.3 Legal Requirements</h3>
              <p className="leading-relaxed">
                We may disclose your information if required by law, regulation, legal process, or governmental request, 
                including:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Compliance with court orders, subpoenas, or warrants</li>
                <li>Response to law enforcement requests</li>
                <li>Compliance with anti-money laundering (AML) and know-your-customer (KYC) regulations</li>
                <li>Protection of our rights, property, or safety, or that of our users or others</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">4.4 Business Transfers</h3>
              <p className="leading-relaxed">
                In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information 
                may be transferred as part of that transaction. We will notify you of any such change in ownership or 
                control.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">4.5 With Your Consent</h3>
              <p className="leading-relaxed">
                We may share your information with your explicit consent or at your direction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-green-400" />
                5. Data Security
              </h2>
              <p className="leading-relaxed">
                We implement technical and organizational measures designed to protect your information:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Encryption of data in transit using SSL/TLS protocols</li>
                <li>Secure storage practices for non-blockchain data</li>
                <li>Regular security assessments and vulnerability testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection and privacy</li>
              </ul>
              <p className="leading-relaxed mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we 
                strive to protect your information, we cannot guarantee absolute security. You are responsible for 
                maintaining the security of your wallet private keys and passwords.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-yellow-400">Important:</strong> As a decentralized platform, we do not control 
                or have access to your wallet private keys. You are solely responsible for securing your wallet and 
                private keys. Loss of private keys may result in permanent loss of access to your funds.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to collect and store information about your use of the 
                Platform:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the Platform to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Session Cookies:</strong> Maintain your session while using the Platform</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling certain cookies may affect 
                Platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights and Choices</h2>
              <p className="leading-relaxed">
                Depending on your jurisdiction, you may have certain rights regarding your personal information:
              </p>

              <h3 className="text-xl font-semibold text-white mt-4 mb-2">7.1 General Rights</h3>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal 
                    obligations and blockchain immutability)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">7.2 GDPR Rights (EU/EEA Users)</h3>
              <p className="leading-relaxed">
                If you are located in the European Union or European Economic Area, you have additional rights under 
                the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">7.3 Limitations</h3>
              <p className="leading-relaxed">
                <strong className="text-yellow-400">Important:</strong> Due to the decentralized nature of blockchain 
                technology, certain information (such as on-chain transactions) cannot be deleted or modified. Once 
                recorded on the blockchain, this information is permanent and publicly accessible.
              </p>
              <p className="leading-relaxed mt-4">
                To exercise your rights, please contact us at privacy@metapredict.fun. We will respond to your 
                request within 30 days, subject to applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy 
                Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="leading-relaxed mt-4">
                <strong className="text-yellow-400">Blockchain Data:</strong> Information recorded on the blockchain 
                is permanent and cannot be deleted. This includes transaction history, wallet addresses, and smart 
                contract interactions.
              </p>
              <p className="leading-relaxed mt-4">
                <strong>Off-Chain Data:</strong> We may retain off-chain data (such as support communications, 
                analytics data) for up to 7 years after your last interaction with the Platform, or as required by 
                applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                These countries may have data protection laws that differ from those in your country.
              </p>
              <p className="leading-relaxed mt-4">
                By using the Platform, you consent to the transfer of your information to countries outside your 
                jurisdiction, including but not limited to the British Virgin Islands, United States, and other 
                jurisdictions where our service providers operate.
              </p>
              <p className="leading-relaxed mt-4">
                We take appropriate safeguards to ensure that your information receives an adequate level of protection 
                in the jurisdictions in which we process it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
              <p className="leading-relaxed">
                The Platform is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children under 18. If you become aware that a child has provided us with 
                personal information, please contact us immediately. If we become aware that we have collected 
                personal information from a child under 18, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, 
                legal requirements, or other factors. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Posting the updated Privacy Policy on the Platform</li>
                <li>Updating the "Last Updated" date at the top of this policy</li>
                <li>Sending you an email notification (if we have your email address)</li>
                <li>Displaying a prominent notice on the Platform</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Your continued use of the Platform after any changes to this Privacy Policy constitutes your acceptance 
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <p className="leading-relaxed mt-4">
                <strong>Privacy Officer:</strong><br />
                <strong>Email:</strong> privacy@metapredict.fun<br />
                <strong>Website:</strong> https://metapredict.fun<br />
                <strong>X (Twitter):</strong> @metapredictbnb<br />
                <strong>Telegram:</strong> @metapredictbnb
              </p>
              <p className="leading-relaxed mt-4">
                For GDPR-related inquiries, you also have the right to lodge a complaint with your local data 
                protection authority.
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-200">
                <strong>By using MetaPredict.fun, you acknowledge that you have read and understood this Privacy 
                Policy and consent to the collection, use, and disclosure of your information as described herein.</strong>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

