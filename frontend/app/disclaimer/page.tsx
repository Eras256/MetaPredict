'use client';

import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Shield, Ban, Info } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';

export default function DisclaimerPage() {
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
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Disclaimer</h1>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            <p>Last Updated: December 15, 2025</p>
            <p>Effective Date: December 15, 2025</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-lg mb-8">
              <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                IMPORTANT LEGAL NOTICE
              </h2>
              <p className="text-lg leading-relaxed text-red-200">
                <strong>PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE USING METAPREDICT.FUN.</strong> By accessing or 
                using the Platform, you acknowledge that you have read, understood, and agree to be bound by this 
                Disclaimer. If you do not agree with any part of this Disclaimer, you must not use the Platform.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-400" />
                1. Testnet Status and Experimental Nature
              </h2>
              <p className="leading-relaxed">
                <strong className="text-yellow-400">MetaPredict.fun is currently operating on opBNB Testnet, which 
                is a test network environment.</strong> The Platform is experimental software in active development. 
                All features, services, and functionalities are provided "as is" and "as available" without warranties 
                of any kind.
              </p>
              <p className="leading-relaxed mt-4">
                <strong>Testnet tokens and digital assets have NO REAL-WORLD VALUE.</strong> Any tokens, funds, or 
                assets used on the testnet are for testing purposes only and cannot be exchanged for real currency or 
                used outside the testnet environment.
              </p>
              <p className="leading-relaxed mt-4">
                The Platform may contain bugs, errors, vulnerabilities, or other defects that could result in loss of 
                data, functionality, or testnet assets. We do not guarantee that the Platform will be uninterrupted, 
                secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Ban className="w-6 h-6 text-red-400" />
                2. No Financial Advice
              </h2>
              <p className="leading-relaxed">
                <strong className="text-red-400">NOTHING ON THE PLATFORM CONSTITUTES FINANCIAL, INVESTMENT, LEGAL, 
                TAX, OR OTHER PROFESSIONAL ADVICE.</strong> The Platform is a technology platform that enables users 
                to create and participate in prediction markets. We do not:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Provide investment advice or recommendations</li>
                <li>Endorse or recommend any particular market, prediction, or strategy</li>
                <li>Guarantee any returns or outcomes</li>
                <li>Act as a financial advisor, broker, or investment manager</li>
                <li>Provide legal or tax advice</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You should consult with qualified financial, legal, and tax professionals before making any decisions 
                related to prediction markets, cryptocurrencies, or blockchain technology. All decisions regarding 
                participation in markets are solely your own.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                3. Regulatory Status and Legal Compliance
              </h2>
              <p className="leading-relaxed">
                <strong className="text-yellow-400">Prediction markets, gambling, and cryptocurrency activities are 
                subject to varying legal and regulatory requirements in different jurisdictions.</strong> Laws and 
                regulations regarding these activities are complex, evolving, and may differ significantly between 
                countries, states, and localities.
              </p>
              <p className="leading-relaxed mt-4">
                We are actively working with legal and regulatory advisors in multiple jurisdictions, including Mexico, 
                British Virgin Islands (BVI), and other international jurisdictions, to ensure compliance with 
                applicable laws and regulations. However, <strong>we make no representations or warranties regarding 
                the legal status of prediction markets or cryptocurrency activities in your jurisdiction.</strong>
              </p>
              <p className="leading-relaxed mt-4">
                <strong>YOU ARE SOLELY RESPONSIBLE FOR:</strong>
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Determining whether your use of the Platform is legal in your jurisdiction</li>
                <li>Complying with all applicable laws, regulations, and restrictions</li>
                <li>Obtaining any necessary licenses, permits, or authorizations</li>
                <li>Paying any applicable taxes on transactions or winnings</li>
                <li>Complying with anti-money laundering (AML) and know-your-customer (KYC) requirements</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We reserve the right to restrict or deny access to users from certain jurisdictions at our sole 
                discretion. If you are located in a jurisdiction where prediction markets, gambling, or cryptocurrency 
                trading is prohibited or restricted, you must not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Risks and Limitations</h2>
              <p className="leading-relaxed">
                <strong className="text-red-400">USE OF THE PLATFORM INVOLVES SUBSTANTIAL RISKS. YOU COULD LOSE ALL 
                FUNDS DEPOSITED IN MARKETS.</strong> By using the Platform, you acknowledge and accept the following 
                risks:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">4.1 Technical Risks</h3>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Smart Contract Risks:</strong> Smart contracts are immutable once deployed. Bugs, 
                    vulnerabilities, or exploits may result in loss of funds. Smart contract code is open-source, 
                    but errors may exist.</li>
                <li><strong>Blockchain Risks:</strong> Blockchain networks may experience congestion, forks, attacks, 
                    or other technical issues that could affect Platform operation or result in loss of funds.</li>
                <li><strong>Network Risks:</strong> The Platform depends on blockchain network availability. Network 
                    failures, forks, or attacks could prevent access to funds or Platform functionality.</li>
                <li><strong>Wallet Security:</strong> Loss of private keys, wallet compromise, or phishing attacks 
                    may result in permanent loss of funds. We do not control or have access to your wallet.</li>
                <li><strong>Technology Failures:</strong> The Platform relies on complex technology that may fail, 
                    including AI systems, blockchain infrastructure, and third-party services.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">4.2 Market and Financial Risks</h3>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Market Risk:</strong> Prediction markets involve financial risk. You may lose all funds 
                    deposited in markets if your predictions are incorrect.</li>
                <li><strong>Liquidity Risk:</strong> Markets may have limited liquidity, making it difficult to buy 
                    or sell positions at desired prices.</li>
                <li><strong>Oracle Risk:</strong> AI-powered oracles may produce incorrect or biased results, 
                    potentially affecting market resolutions and payouts.</li>
                <li><strong>Dispute Risk:</strong> Market resolutions may be disputed, delayed, or subject to DAO 
                    governance processes that may not resolve in your favor.</li>
                <li><strong>Insurance Limitations:</strong> While we offer insurance mechanisms, coverage may be 
                    limited, subject to terms and conditions, and may not cover all losses.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">4.3 Regulatory and Legal Risks</h3>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Regulatory Changes:</strong> Laws and regulations regarding prediction markets and 
                    cryptocurrencies are evolving and may change, potentially affecting Platform availability or 
                    legality.</li>
                <li><strong>Enforcement Actions:</strong> Regulatory authorities may take enforcement actions 
                    against the Platform or users, potentially resulting in loss of access or funds.</li>
                <li><strong>Tax Obligations:</strong> You may be subject to tax obligations on transactions or winnings, 
                    and failure to comply may result in penalties.</li>
                <li><strong>Sanctions:</strong> Use of the Platform may be restricted or prohibited in certain 
                    jurisdictions or for certain individuals or entities.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-2">4.4 Operational Risks</h3>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Platform Modifications:</strong> We may modify, suspend, or terminate the Platform at any 
                    time without prior notice.</li>
                <li><strong>Third-Party Dependencies:</strong> The Platform relies on third-party services (AI 
                    providers, blockchain networks, Chainlink) that may fail, be unavailable, or change their terms.</li>
                <li><strong>No Guarantee of Continuity:</strong> We do not guarantee that the Platform will continue 
                    to operate or be available in the future.</li>
                <li><strong>Testnet to Mainnet Transition:</strong> There is no guarantee that the Platform will 
                    transition to mainnet or that testnet activity will carry over to mainnet.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
              <p className="leading-relaxed">
                <strong className="text-red-400">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, METAPREDICT.FUN, 
                ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE 
                FOR ANY DAMAGES WHATSOEVER ARISING OUT OF OR RELATING TO YOUR USE OF THE PLATFORM, INCLUDING BUT NOT 
                LIMITED TO:</strong>
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Direct, indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or other intangible losses</li>
                <li>Loss of funds, tokens, or digital assets</li>
                <li>Damages resulting from bugs, errors, or vulnerabilities in smart contracts</li>
                <li>Damages resulting from AI oracle inaccuracies or failures</li>
                <li>Damages resulting from blockchain network issues or failures</li>
                <li>Damages resulting from regulatory actions or changes in law</li>
                <li>Damages resulting from unauthorized access to your wallet or account</li>
                <li>Damages resulting from market manipulation or fraud</li>
                <li>Damages resulting from Platform modifications, suspension, or termination</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100) 
                OR THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRIOR TO THE ACTION GIVING RISE TO LIABILITY, 
                WHICHEVER IS GREATER.</strong>
              </p>
              <p className="leading-relaxed mt-4">
                Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above 
                limitations may not apply to you. However, to the extent permitted by law, our liability is limited 
                as described above.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. No Warranties</h2>
              <p className="leading-relaxed">
                <strong className="text-red-400">THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT 
                WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.</strong> To the maximum extent permitted by 
                applicable law, we disclaim all warranties, including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                <li>Warranties that the Platform will be uninterrupted, secure, error-free, or free of viruses</li>
                <li>Warranties regarding the accuracy, reliability, or completeness of information on the Platform</li>
                <li>Warranties that AI oracles will produce accurate or correct results</li>
                <li>Warranties that smart contracts are free of bugs or vulnerabilities</li>
                <li>Warranties regarding the availability or performance of blockchain networks</li>
                <li>Warranties that the Platform will transition to mainnet or continue operating</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. No Endorsement</h2>
              <p className="leading-relaxed">
                Reference to any third-party services, products, or technologies (including but not limited to Gemini, 
                Llama, Mistral AI, Chainlink, opBNB, MetaMask, or other blockchain networks) does not constitute an 
                endorsement, recommendation, or warranty by MetaPredict.fun. We are not responsible for the 
                availability, accuracy, or performance of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Forward-Looking Statements</h2>
              <p className="leading-relaxed">
                The Platform may contain forward-looking statements regarding future features, developments, or 
                regulatory compliance. These statements are based on current expectations and are subject to risks, 
                uncertainties, and assumptions. Actual results may differ materially from those expressed or implied 
                in forward-looking statements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Testnet to Mainnet Transition</h2>
              <p className="leading-relaxed">
                <strong className="text-yellow-400">There is no guarantee that the Platform will transition to 
                mainnet or that any testnet activity, tokens, or data will carry over to a mainnet version.</strong> 
                The transition to mainnet is subject to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Obtaining necessary regulatory approvals and compliance certifications</li>
                <li>Successful completion of security audits and testing</li>
                <li>Technical feasibility and infrastructure requirements</li>
                <li>Our business decisions and strategic considerations</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Participation in the testnet does not grant any rights, claims, or expectations regarding a mainnet 
                version of the Platform. We reserve the right to modify, suspend, or terminate the Platform at any 
                time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. User Responsibility</h2>
              <p className="leading-relaxed">
                <strong className="text-yellow-400">YOU ARE SOLELY RESPONSIBLE FOR:</strong>
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Your use of the Platform and all decisions regarding participation in markets</li>
                <li>Securing your wallet, private keys, and account credentials</li>
                <li>Understanding the risks associated with prediction markets and blockchain technology</li>
                <li>Complying with all applicable laws and regulations</li>
                <li>Paying any applicable taxes on transactions or winnings</li>
                <li>Evaluating the accuracy and completeness of information on the Platform</li>
                <li>Protecting yourself from fraud, phishing, and other security threats</li>
                <li>Never betting more than you can afford to lose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Disclaimer</h2>
              <p className="leading-relaxed">
                We reserve the right to modify this Disclaimer at any time. Material changes will be posted on the 
                Platform with an updated "Last Updated" date. Your continued use of the Platform after any changes 
                constitutes your acceptance of the modified Disclaimer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about this Disclaimer, please contact us at:
              </p>
              <p className="leading-relaxed mt-4">
                <strong>Email:</strong> legal@metapredict.fun<br />
                <strong>Website:</strong> https://metapredict.fun<br />
                <strong>X (Twitter):</strong> @metapredictbnb<br />
                <strong>Telegram:</strong> @metapredictbnb
              </p>
            </section>

            <div className="mt-8 p-6 bg-red-500/10 border-2 border-red-500/30 rounded-lg">
              <h3 className="text-xl font-bold text-red-400 mb-4">ACKNOWLEDGMENT</h3>
              <p className="text-lg leading-relaxed text-red-200">
                <strong>BY USING METAPREDICT.FUN, YOU ACKNOWLEDGE THAT:</strong>
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4 text-red-200">
                <li>You have read, understood, and agree to be bound by this Disclaimer</li>
                <li>You understand the risks associated with using the Platform</li>
                <li>You are solely responsible for your use of the Platform</li>
                <li>You will never bet more than you can afford to lose</li>
                <li>You will comply with all applicable laws and regulations</li>
                <li>You understand that the Platform is experimental and operates on testnet</li>
                <li>You understand that testnet tokens have no real-world value</li>
                <li>You understand that there is no guarantee of Platform continuity or mainnet transition</li>
              </ul>
              <p className="text-lg leading-relaxed mt-4 text-red-200">
                <strong>IF YOU DO NOT AGREE WITH ANY PART OF THIS DISCLAIMER, YOU MUST NOT USE THE PLATFORM.</strong>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

