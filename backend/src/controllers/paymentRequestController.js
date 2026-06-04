const PaymentRequest = require('../models/PaymentRequest');

async function getAll(req, res, next) {
  try {
    const { role, _id } = req.user;
    const filter = (role === 'admin' || role === 'moderator') ? {} : { userId: _id };
    const requests = await PaymentRequest.find(filter).sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const data = { ...req.body, userId: req.user._id };
    const paymentRequest = await PaymentRequest.create(data);
    res.status(201).json(paymentRequest);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const { role } = req.user;
    if (role !== 'admin' && role !== 'moderator') {
      return res.status(403).json({ message: 'Admin or moderator access required' });
    }

    const { status, adminNotes } = req.body;
    const update = {
      status,
      adminNotes: adminNotes || '',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };

    const paymentRequest = await PaymentRequest.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }
    res.json(paymentRequest);
  } catch (err) { next(err); }
}

module.exports = { getAll, create, updateStatus };
