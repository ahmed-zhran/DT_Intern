const asyncHandler = fn => (req, res, next) =>
  Promise
        .resolve(fn(req, res, next))
        .catch((next) => {
          // console.log(`${next}`.red);
          res.status(400).json({msg:`${next}`});
        });

module.exports = asyncHandler;
