import PureComponent from '../../immutable-component';
import PropTypes from 'prop-types';

export default class Page extends PureComponent {
    loadContent() {
        this.props.loadContent({
            page: this.props.page,
            loading: !this.props.loaded
        });
    }
    componentDidMount() {
        this.loadContent();
    }
}

Page.propTypes = {
    page: PropTypes.string.isRequired,
    loaded: PropTypes.bool.isRequired,
    loadContent: PropTypes.func.isRequired
};

