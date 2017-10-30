import { shallow } from 'enzyme';

export default (component, store) => {
    const context = { store };

    return shallow(component, { context });
}

