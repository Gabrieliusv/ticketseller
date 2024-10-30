import axios from 'axios';

export default ({ req }) => {
  const onServer = typeof window === 'undefined';

  if (onServer) {
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
    return data;
  } else {
    //on browser
    return axios.create({
      baseURL: '/',
    });
  }
};
