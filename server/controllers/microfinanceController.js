const MicrofinanceLoan = require('../models/microfinanceModel');
const Notification = require('../models/notificationSystemModel');


const applyForLoan = async (req, res) => {
    try {
        const { providerName, amount, purpose } = req.body;

        const loan = await MicrofinanceLoan.create({
            user: req.user._id,
            providerName,
            amount,
            purpose
        });


        simulateBankDecision(loan._id, req.user._id, providerName);

        res.status(201).json({ 
            message: 'Application submitted. Waiting for bank decision...', 
            loan 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getMyLoans = async (req, res) => {
    try {
        const loans = await MicrofinanceLoan.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const simulateBankDecision = async (loanId, userId, providerName) => {
    setTimeout(async () => {
        try {
            const isApproved = Math.random() > 0.3;
            const status = isApproved ? 'Approved' : 'Rejected';
            const reason = isApproved ? '' : 'Credit score too low based on simulated check.';

            // Update Database
            await MicrofinanceLoan.findByIdAndUpdate(loanId, {
                status,
                rejectionReason: reason
            });

            // Send Notification
            await Notification.create({
                user: userId,
                title: `Loan ${status}`,
                message: `Your application for ৳${providerName} has been ${status}.`,
                type: 'loan_update',
                link: '/microfinance',
                isRead: false
            });

            console.log(`[MockBank] Loan ${loanId} processed: ${status}`);

        } catch (error) {
            console.error("Simulation Error:", error);
        }
    }, 5000); // 5000ms delay
};

module.exports = { applyForLoan, getMyLoans };