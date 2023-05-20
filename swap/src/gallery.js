const importAll = (r) => {
    console.log('r', r)
  let images = {};
    r.keys().forEach((key) => {
        images[key] = r(key);
    });
    return images;
};

const images = importAll(
  require.context('./gallery', false)
);
console.log(images)

export default images;

