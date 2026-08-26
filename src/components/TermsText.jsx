import React from 'react';
import { ShieldAlert, Building2, Mail } from 'lucide-react';

const TermsText = () => {
    return (
        <div className="space-y-12">
            {/* 1. INTRODUCTION */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">1.</span> Introduction
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>1.1</strong> We are Fydblock Pvt Ltd, a company formed under the laws of the Democratic Socialist Republic of Sri Lanka, with company number PV 00349799, address 432, Kayar Road, Eravur 2A, Batticaloa, Sri Lanka (“Fydblock”, “we”, “us” or “our”).</p>
                    <p><strong>1.2</strong> We provide tools and functionalities that allow managing personal cryptocurrency holdings (“Software”, as defined in Section 2 below). These terms of use (“Terms of Use”) govern the access and use of the Software. The Software is accessible through the website https://fydblock.com (“Website”) and/or via the Fydblock mobile application(s) (“App”) and application program interface(s).</p>
                    <p><strong>1.3</strong> The term “you” or “Client” refers to you, a natural person, or the legal entity on whose behalf you have accepted or otherwise agreed to these Terms of Use. If you accept these Terms of Use on behalf of a legal entity, you represent and warrant that you have the authority to bind that legal entity to these Terms of Use. If you are a developer using Fydblock API these terms do not apply to you.</p>
                    <p><strong>1.4</strong> By accepting these Terms of Use or accessing the Software, you agree to be bound by these Terms of Use and any policies referred herein, including but not limited to the Privacy Notice, Refund Policy and Recurring Payments Policy, which all form part of these Terms of Use. Acceptance of these Terms of Use shall constitute the entire, complete, and binding agreement between you and Fydblock (individually “Party”, together “Parties”) with respect to the Software. If you do not wish to be bound by these Terms of Use do not create an account, and/or access the Software, and/or make use of any service covered by these Terms of Use.</p>
                </div>
            </section>

            {/* 2. DEFINITIONS */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">2.</span> Definitions
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-white">
                                <th className="py-3 pr-4 font-semibold w-1/3">Term</th>
                                <th className="py-3 pl-4 font-semibold">Definition</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr><td className="py-3 pr-4 text-white">Software</td><td className="py-3 pl-4">Tools and functionalities provided by Fydblock for managing your cryptocurrency holdings</td></tr>
                            <tr><td className="py-3 pr-4 text-white">Client Account</td><td className="py-3 pl-4">The account created by you for accessing the Software</td></tr>
                            <tr><td className="py-3 pr-4 text-white">Exchange Account</td><td className="py-3 pl-4">Cryptocurrency exchange account from the available exchanges</td></tr>
                            <tr><td className="py-3 pr-4 text-white">Subscription Purchase</td><td className="py-3 pl-4">Purchase of any paid Plan</td></tr>
                            <tr><td className="py-3 pr-4 text-white">Month</td><td className="py-3 pl-4">30 calendar days</td></tr>
                            <tr><td className="py-3 pr-4 text-white">Plan</td><td className="py-3 pl-4">A subscription plan for the Software with specific features and functionalities as described on the Website</td></tr>
                            <tr><td className="py-3 pr-4 text-white">Fee</td><td className="py-3 pl-4">Amount paid for Subscription Purchase</td></tr>
                            <tr><td className="py-3 pr-4 text-white">Trial</td><td className="py-3 pl-4">Software made available on a trial basis free of charge</td></tr>
                            <tr><td className="py-3 pr-4 text-white">Client Content</td><td className="py-3 pl-4">Content and data that you insert or make available via the Software</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 3. SOFTWARE Functionalities */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">3.</span> Software Functionalities
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>3.1</strong> The Software provides you with tools and functionalities that allow you to manage your cryptocurrency holdings across the Exchange Accounts, including but not limited to:</p>
                    <ul className="list-disc pl-5 space-y-2 ml-4">
                        <li><strong>3.1.1 Free functionalities:</strong> These are tools and functionalities with free of charge access without subscription to a paid Plan. Fydblock can change tools and functionalities offered free of charge without notice at its sole discretion. Services available in each jurisdiction may vary.</li>
                        <li><strong>3.1.2 Subscribed functionalities:</strong> These are tools and functionalities which contain services and content that may be only available through the applicable Plan. The subscribed functionalities shall be those provided under the selected Plan at the time your offer to conclude the Subscription Purchase is placed.</li>
                    </ul>
                    <p><strong>3.2</strong> More detailed information in relation to each free and subscribed functionality is available on our Website. By accessing and using any free or subscribed functionality you acknowledge and confirm that you have familiarized yourself with all the information available on the Website in relation to this free or subscribed functionality.</p>
                </div>
            </section>

            {/* 4. TESTING */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">4.</span> Testing
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>4.1 Beta testing:</strong> Beta testing is a functionality, in which Fydblock provides you the possibility from time to time to use pre-release or beta features for internal testing, evaluation and feedback purposes. Features tested during the Beta testing phase may be modified, discontinued, or incorporated into the final Software at the sole discretion of Fydblock at any time. By choosing to participate in Beta testing you acknowledge that participation is voluntary, the Software is "as is" without warranty, and agree to keep information confidential.</p>
                    <p><strong>4.2 A/B testing:</strong> A/B testing is random controlled testing, which Fydblock can conduct by randomly assigning Clients to a group (A/B) upon entering the Website and creating a Client Account.</p>
                    <p><strong>4.3</strong> As a result of A/B testing Clients in different groups may experience variations in features, visual styles, pricing structures, and other aspects of the Software’s functionality.</p>
                    <p><strong>4.4</strong> By using our Software, you agree to accept the assignment to either group and acknowledge that the client experience may differ accordingly.</p>
                </div>
            </section>

            {/* 5. ELIGIBILITY */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">5.</span> Eligibility & Account
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>5.1 Eligibility criteria:</strong> To access the Software, you must meet the following criteria:</p>
                    <ul className="list-none pl-0 space-y-2 ml-4">
                        <li>5.1.1 Full power, authority and capacity to enter into these Terms.</li>
                        <li>5.1.2 At least 18 years of age.</li>
                        <li>5.1.3 Not suspended from accessing the Software.</li>
                        <li>5.1.4 Use the Software only for yourself and not for third parties.</li>
                        <li>5.1.5 Do not engage in illegal activity.</li>
                        <li>5.1.6 Meet conditions in Section 27.1.</li>
                        <li>5.1.7 Access does not breach applicable laws in your jurisdiction.</li>
                    </ul>
                    <p><strong>5.2 Creating a Client Account:</strong> You are required to provide truthful, up-to-date information. Fydblock has the right to refuse to provide a Client Account at its sole discretion.</p>
                    <p><strong>5.3 Connecting with an Exchange Account:</strong> You must connect your personal Exchange Account to use trading functions. Suspension of your Exchange Account will affect Software availability. Fydblock may drop API keys for security purposes.</p>
                </div>
            </section>

            {/* 6. FREE TRIAL */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">6.</span> Free Trial
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>6.1</strong> Fydblock offers a Trial of its Software to some of its Clients. The Trial version may be used only for evaluating the Software.</p>
                    <p><strong>6.2</strong> Trial eligibility is determined by Fydblock. You must create a Client Account to access the Trial.</p>
                    <p><strong>6.3</strong> The Trial period ends upon the earlier of: expiration of the trial period, purchase of a subscription Plan, termination by you, or termination by Fydblock.</p>
                    <p><strong>6.4</strong> Upon completion of the Trial, any ongoing trades will persist, and your subscription will convert to the chosen Plan.</p>
                </div>
            </section>

            {/* 7. INTENDED USE */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">7.</span> Intended & Prohibited Use
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>7.1</strong> You may use the Software only for managing personal cryptocurrency holdings within the intended purpose.</p>
                    <p><strong>7.2</strong> Prohibited uses include: managing multiple accounts without appropriate plan, impersonation, trading on restricted platforms, uploading unlawful/harmful content, uploading viruses, reverse engineering the Software, interfering with the Software, removing copyright notices, infringing intellectual property, harvesting email addresses, or violating laws.</p>
                    <p><strong>7.3</strong> Failure to observe limits of purpose and permitted use is a material breach entitling Fydblock to terminate your Client Account.</p>
                </div>
            </section>

            {/* 8. SECURITY */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">8.</span> Security of Client Account
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>8.1</strong> Your Client Account is personal. You are responsible for all activities.</p>
                    <p><strong>8.2</strong> You must maintain security by: abiding by security procedures (2FA), keeping data confidential, keeping account data up to date, exercising caution on shared computers, logging out, and monitoring account history.</p>
                    <p><strong>8.3</strong> If you suspect a breach, notify us immediately and take measures to minimize the breach (e.g., disable exchange connection).</p>
                </div>
            </section>

            {/* 9. PLANS */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">9.</span> Plans
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>9.1</strong> Fydblock offers Plans with specific features (free or for a Fee). Details are on the Website.</p>
                    <p><strong>9.4</strong> Selecting a Plan and submitting payment is an offer to purchase, which must be accepted by us.</p>
                    <p><strong>9.6 Changing a Plan:</strong> You may upgrade/downgrade at any time. New plans activate immediately after payment.</p>
                    <p><strong>9.7 Renewal:</strong> Subscriptions automatically renew for the same period unless notice of non-renewal is given.</p>
                    <p><strong>9.8</strong> All Subscription Purchases enable recurring payments.</p>
                </div>
            </section>

            {/* 10. FEES */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">10.</span> Fees, Payments & Refunds
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>10.1 Fees:</strong> You will pay the Fee displayed at the time of purchase. Fees are subject to change.</p>
                    <p><strong>10.3 Taxes:</strong> Payments may be subject to VAT/taxes based on your location.</p>
                    <p><strong>10.4 Payment terms:</strong> You must initiate payment when submitting the order. Fydblock does not guarantee availability of any payment method.</p>
                    <p><strong>10.7</strong> You represent you are authorized to use the payment method and will pay all charges.</p>
                    <p><strong>10.9 Refund:</strong> Due to the nature of digital products, no refunds are granted without clear, justified reasons, subject to our Refund Policy.</p>
                </div>
            </section>

            {/* 11. IP */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">11.</span> Intellectual Property
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>11.1</strong> The Software and its content are the exclusive property of Fydblock.</p>
                    <p><strong>11.2</strong> Fydblock grants you a personal, non-exclusive, revocable license to use the Software.</p>
                    <p><strong>11.3</strong> You have no right to rent, lease, copy, reverse engineer, or create derivative works.</p>
                    <p><strong>11.4</strong> You grant Fydblock a right to use Client Content for providing the Software, research, analytics, improvement, and other purposes.</p>
                </div>
            </section>

            {/* 12. UPDATES */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">12.</span> Updates
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>12.1</strong> Fydblock may provide updates containing enhancements, debuggings, or modifications.</p>
                    <p><strong>12.2 Remedies for lack of conformity:</strong> You are entitled to have the Software brought into conformity. If not possible, you may be entitled to price reduction or termination.</p>
                </div>
            </section>

            {/* 13. INTERRUPTION */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">13.</span> Interruption & Suspension
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>13.1</strong> Fydblock may interrupt the Software for maintenance/repairs.</p>
                    <p><strong>13.2</strong> Fydblock may suspend access if you are no longer eligible, breach terms, provide false info, fail to pay fees, interfere with the Software, or for security reasons.</p>
                </div>
            </section>

            {/* 14. TERMINATION */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">14.</span> Term & Termination
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>14.4 Termination of the Plan:</strong> You have a 14-day cooling-off period. After that, you may terminate via account settings. Fydblock may terminate for violations.</p>
                    <p><strong>14.5 Termination of Client Account:</strong> You may delete your account at any time. Fydblock may terminate with 7 days notice, or immediately for material breach (e.g., money laundering risk, illegal activity).</p>
                    <p><strong>14.6 Consequences:</strong> Termination terminates access to Software and deletes data (subject to retention laws).</p>
                </div>
            </section>

            {/* 15-16. DATA & AVAILABILITY */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">15-16.</span> Data & Availability
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>15.1</strong> Fydblock processes personal data per the Privacy Notice.</p>
                    <p><strong>16.1</strong> The Software is provided "as is" and "as available". Fydblock does not guarantee availability at all times.</p>
                </div>
            </section>

            {/* 17. DISCLAIMERS */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="text-[#00FF9D]" size={20} />
                    <span className="text-[#00FF9D]">17.</span> Disclaimers
                </h2>
                <div className="text-gray-400 space-y-4 text-xs font-mono uppercase leading-relaxed">
                    <p>17.1 FYDBLOCK DOES NOT PROVIDE FINANCIAL, INVESTMENT, LEGAL, OR TAX ADVICE. USE OF THE SOFTWARE IS AT YOUR SOLE RISK.</p>
                    <p>17.2 THE SOFTWARE IS PROVIDED "AS IS". FYDBLOCK DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.</p>
                    <p>17.4 YOU MAY LOSE SOME OR ALL FUNDS. CRYPTOCURRENCIES ARE RISKY AND INSUFFICIENTLY TESTED.</p>
                    <p>17.6 FYDBLOCK SHALL NOT BE LIABLE FOR LOSSES ARISING FROM FORESEEN OR UNFORESEEN RISKS.</p>
                </div>
            </div>

            {/* 18. LIABILITY */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">18.</span> Limitation of Liability
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p className="uppercase text-xs font-mono">18.2 FYDBLOCK SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.</p>
                    <p className="uppercase text-xs font-mono">18.3 LIABILITY IS LIMITED TO FEES PAID IN THE LAST 24 MONTHS (OR USD 100 FOR FREE USERS).</p>
                </div>
            </section>

            {/* 19-26. REMAINING */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#00FF9D]">19-26.</span> Other Provisions
                </h2>
                <div className="text-gray-400 leading-7 space-y-4 text-sm md:text-base">
                    <p><strong>19. Indemnification:</strong> You agree to indemnify Fydblock against claims arising from your breach or use.</p>
                    <p><strong>22. Governing Law:</strong> Laws of the Democratic Socialist Republic of Sri Lanka.</p>
                    <p><strong>23. Complaints:</strong> Contact complaints@fydblock.com. Disputes settled in Sri Lankan courts.</p>
                    <p><strong>24. Changes:</strong> Fydblock may change these Terms. Continued use implies acceptance.</p>
                    <p><strong>26. Compliance:</strong> You warrant you are not subject to sanctions (EU, UN, US, UK, etc.).</p>
                </div>
            </section>

            <div className="pt-8 border-t border-white/10 grid md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Building2 size={16} className="text-[#00FF9D]" />
                        Company Details
                    </h4>
                    <p className="text-gray-500 text-sm">© 2025. Fydblock Pvt Ltd.<br />PV: 00349799<br />Address: 432, Kayar Road, Eravur 2A,<br />Batticaloa, Sri Lanka.</p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Mail size={16} className="text-[#00FF9D]" />
                        Contact
                    </h4>
                    <p className="text-gray-500 text-sm">Support: support@fydblock.com<br />Complaints: complaints@fydblock.com</p>
                </div>
            </div>
        </div>
    );
};

export default TermsText;
