import nextConfig from 'eslint-config-next';
console.log(Object.keys(nextConfig));
if (nextConfig.flat) {
  console.log('Has flat config!');
}
