const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ status: 'error', message: errorMessage });
  }
  next();
};

const retentionSchemas = {
  simulate: Joi.object({
    user_id: Joi.string().required(),
    plan_tier: Joi.string(),
    usage_score: Joi.number(),
    complaints_count: Joi.number(),
    network_drops: Joi.number(),
    payment_status: Joi.string()
  }),
  claimEscalation: Joi.object({
    escalation_id: Joi.string().required(),
    user_id: Joi.string().required(),
    specialist_id: Joi.string().required(),
    specialist_name: Joi.string().required(),
    churn_risk: Joi.number()
  })
};

module.exports = {
  validate,
  retentionSchemas
};
