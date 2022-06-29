import * as yup from 'yup';

const schema = yup.object().shape({
  expirePeriod: yup
    .number()
    .min(30)
    .required(),
});

export default schema;