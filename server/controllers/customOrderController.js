const CustomOrder = require('../models/customOrderModel');
const User = require('../models/userModel');

const createCustomOrder = async (req, res) => {
  const { creatorId, portfolioId, details, budget, deadline } = req.body;

  if (!creatorId || !details) {
    return res.status(400).json({ message: 'Creator and details are required' });
  }

  const creator = await User.findById(creatorId);
  if (!creator) {
    return res.status(404).json({ message: 'Creator not found' });
  }

  const order = await CustomOrder.create({
    requester: req.user._id,
    creator: creatorId,
    portfolio: portfolioId || null,
    details,
    budget,
    deadline,
  });

  const populated = await CustomOrder.findById(order._id)
    .populate('requester', 'name email')
    .populate('creator', 'name email')
    .populate('portfolio');

  res.status(201).json(populated);
};

const getMyCustomOrders = async (req, res) => {
  const orders = await CustomOrder.find({ requester: req.user._id })
    .sort({ createdAt: -1 })
    .populate('creator', 'name email')
    .populate('portfolio');

  res.json(orders);
};

const getCreatorCustomOrders = async (req, res) => {
  const orders = await CustomOrder.find({ creator: req.user._id })
    .sort({ createdAt: -1 })
    .populate('requester', 'name email')
    .populate('portfolio');

  res.json(orders);
};

const updateCustomOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!['accepted', 'rejected', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await CustomOrder.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (String(order.creator) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  order.status = status;
  await order.save();

  const populated = await CustomOrder.findById(order._id)
    .populate('requester', 'name email')
    .populate('creator', 'name email')
    .populate('portfolio');

  res.json(populated);
};

module.exports = {
  createCustomOrder,
  getMyCustomOrders,
  getCreatorCustomOrders,
  updateCustomOrderStatus,
};
