define(function (require) {
  return function BytesFormatProvider(Private) {
    var numFormat = Private(require('components/stringify/_num_format'));
    return numFormat('number', '0[]b');
  };
});