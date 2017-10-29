import PureComponent from '../../immutable-component';
import PropTypes from 'prop-types';

export default class Page extends PureComponent {
    constructor(props) {
        super(props);

        this.keydownListener = evt => {
            if (evt.key === 'Tab') {
                evt.preventDefault();
            }

            this.props.handleKeyPress({
                pageIndex: this.props.pageIndex,
                key: evt.key,
                shift: evt.shiftKey,
                ctrl: evt.ctrlKey
            });
        };
    }
    loadContent() {
        if (!this.props.loaded) {
            this.props.loadContent({ pageIndex: this.props.pageIndex });
        }
    }
    componentDidMount() {
        this.loadContent();

        window.addEventListener('keydown', this.keydownListener);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.keydownListener);
    }
}

Page.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    loaded: PropTypes.bool.isRequired,
    loadContent: PropTypes.func.isRequired,
    handleKeyPress: PropTypes.func.isRequired
};

