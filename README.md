Code to reproduce https://github.com/mochajs/mocha/issues/3893

Run command: `node_modules/mocha/bin/mocha *.test.js`

Expected behavior: Mocha reports a non-zero exit code containing an accurate number of failures and logs all tests & the detailed errors

Actual Behavior: Mocha reports a 0 exit code, or a smaller number than all error lines displayed and the log does not complete

NOTE: Surface level debugging indicates the length of runtime affects the output, as I have had runs of the same tests produce different output
And running files one at a time works as expected.

Locally run on Node 8.16
