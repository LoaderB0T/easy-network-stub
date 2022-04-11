[![npm](https://img.shields.io/npm/v/easy-network-stub?color=%2300d26a&style=for-the-badge)](https://www.npmjs.com/package/easy-network-stub)
[![Build Status](https://img.shields.io/github/workflow/status/LoaderB0T/easy-network-stub/CI/main?style=for-the-badge)](https://github.com/LoaderB0T/easy-network-stub/actions/workflows/build.yml)
[![Sonar Quality Gate](https://img.shields.io/sonar/quality_gate/LoaderB0T_easy-network-stub?server=https%3A%2F%2Fsonarcloud.io&style=for-the-badge)](https://sonarcloud.io/summary/new_code?id=LoaderB0T_easy-network-stub)

# easy-network-stub

An easy class to mock a lot of network requests in any e2e framework.

## Framework specific packages 🧪

- [Cypress](https://github.com/LoaderB0T/cypress-easy-network-stub)
- [Playwright](https://github.com/LoaderB0T/playwright-easy-network-stub)

## Motivation 💥

When running tests in e2e frameworks, sometimes you want to mock all network requests. Especially when running tests in a CI environment. This package provides an easy and type safe way to mock network requests for a whole API.

## Features 🔥

✅ Easy to setup and use

✅ Type safe url and query parameters

✅ Add your own parameter matchers

✅ Works asynchronously (Promise based)

✅ Supports failing of stubbed requests

✅ No production dependencies

The primary use case for this package is to create a mock server for your tests so that they do not need real network requests.

## Built With 🔧

- [TypeScript](https://www.typescriptlang.org/)

## Usage Example 🚀

You can find usage examples in the existing framework-specific wrappers for this package: [Playwright](https://github.com/LoaderB0T/playwright-easy-network-stub) or [Cypress](https://github.com/LoaderB0T/cypress-easy-network-stub)

## Strongly typed api parameters:

You can add types to parameters and they will be parsed. Out of box 'string', 'number' and 'boolean' are supported. You can add your own types and parsers though.

<p align="center">
<img src="https://user-images.githubusercontent.com/37637338/162327029-994ce009-d1ab-45cc-ab86-d1e21a0d1a6e.png">
<img src="https://user-images.githubusercontent.com/37637338/162327040-a45381a1-652d-4838-91ae-7dc405bd9ff4.png">
</p>

## Contributing 🧑🏻‍💻

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 🔑

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact 📧

Janik Schumacher - [@LoaderB0T](https://twitter.com/LoaderB0T) - [linkedin](https://www.linkedin.com/in/janikschumacher/)

Project Link: [https://github.com/LoaderB0T/easy-network-stub](https://github.com/LoaderB0T/easy-network-stub)
