import React, { Component } from 'react';
import {
  Text, View, FlatList, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';

import BasePageGereral from '../base/base.page.general';
import RSKad from '../../components/common/rsk.ad';
import Header from '../../components/headers/header';
import appActions from '../../redux/app/actions';
import WebViewModal from '../../components/common/webview.modal';

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 20,
    marginTop: 15,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dappIcon: {
    width: 62,
    height: 62,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  dappInfo: {
    flex: 1,
    marginLeft: 20,
  },
  dappName: {
    color: '#060606',
    fontFamily: 'Avenir-Book',
    fontSize: 18,
  },
  dappDesc: {
    color: '#535353',
    fontSize: 11,
    fontFamily: 'Avenir-Book',
  },
  dappUrl: {
    color: '#ABABAB',
    fontSize: 12,
    fontFamily: 'Avenir-Book',
  },
});

class AppList extends Component {
  static navigationOptions = () => ({
    header: null,
  });

  constructor(props) {
    super(props);

    this.state = {
      isDappWebViewVisible: false,
      dapp: null,
    };
  }

  componentDidMount() {
    const { fetchDapps } = this.props;
    fetchDapps();
  }

  onDappPress = (dapp) => {
    const { addRecentDapp } = this.props;
    addRecentDapp(dapp);
    this.setState({ dapp, isDappWebViewVisible: true });
  }

  render() {
    const {
      navigation, dapps, language, recentDapps,
    } = this.props;
    const { dapp, isDappWebViewVisible } = this.state;
    const title = navigation.state.params.title || '';
    const type = navigation.state.params.type || '';
    let dappList = [];
    if (type === 'recent') {
      dappList = recentDapps;
    } else if (type === 'recommended') {
      dappList = _.filter(dapps, (item) => item.isRecommended);
    } else {
      dappList = dapps;
    }
    return (
      <BasePageGereral
        isSafeView={false}
        hasBottomBtn={false}
        hasLoader={false}
        renderAccessory={() => <RSKad />}
        headerComponent={<Header onBackButtonPress={() => navigation.goBack()} title={title} />}
      >
        <FlatList
          data={dappList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, { marginRight: 15 }]}
              onPress={() => this.onDappPress(item)}
            >
              <Image style={styles.dappIcon} source={{ uri: item.iconUrl }} />
              <View style={styles.dappInfo}>
                <Text style={styles.dappName}>{item.name[language]}</Text>
                <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.dappDesc]}>{item.description[language]}</Text>
                <Text style={styles.dappUrl}>{item.url}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `list-${index}`}
        />

        <WebViewModal
          title={dapp && dapp.title[language]}
          url={dapp && dapp.url}
          visible={isDappWebViewVisible}
          onBackButtonPress={() => { this.setState({ isDappWebViewVisible: false }); }}
        />
      </BasePageGereral>
    );
  }
}

AppList.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    state: PropTypes.object.isRequired,
  }).isRequired,
  dapps: PropTypes.arrayOf(PropTypes.object),
  language: PropTypes.string.isRequired,
  fetchDapps: PropTypes.func.isRequired,
  addRecentDapp: PropTypes.func.isRequired,
  recentDapps: PropTypes.arrayOf(PropTypes.object),
};

AppList.defaultProps = {
  recentDapps: null,
  dapps: null,
};

const mapStateToProps = (state) => ({
  dapps: state.App.get('dapps'),
  recentDapps: state.App.get('recentDapps'),
  language: state.App.get('language'),
});

const mapDispatchToProps = (dispatch) => ({
  fetchDapps: () => dispatch(appActions.fetchDapps()),
  addRecentDapp: (dapp) => dispatch(appActions.addRecentDapp(dapp)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppList);
