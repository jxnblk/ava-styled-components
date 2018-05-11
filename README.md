# ava-styled-components

This is basically [jest-styled-components](https://github.com/styled-components/jest-styled-components) for ava.

## Installation

```
npm i ava-styled-components -D
yarn add ava-styled-components -D
```

## Usage

```jsx
import test from 'ava';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import parseStyles from 'ava-styled-components';

import StyledComponent from './StyledComponent';

test('it should snapshot a styled component', t => {
    t.snapshot(parseStyles(toJson(mount(<StyledComponent />))));
});
```

