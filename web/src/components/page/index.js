import PureComponent from '../../immutable-component';
import PropTypes from 'prop-types';

export default class Page extends PureComponent {
    loadContent() {
        this.props.loadContent({
            pageIndex: this.props.pageIndex,
            loading: !this.props.loaded
        });
    }
    componentDidMount() {
        this.loadContent();
    }
}

Page.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    loaded: PropTypes.bool.isRequired,
    loadContent: PropTypes.func.isRequired
};

