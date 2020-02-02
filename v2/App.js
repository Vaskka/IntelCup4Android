/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, Button} from 'react-native';
import Axios from 'axios';

// 常量
const CONST = {
  DEFAULT_ID: 79,
  DEFAULT_POSITION: '综C201',
  // url
  GATEWAY: 'http://pu.zaeyi.com:12580',
  // 下一节点
  GET_NEXT_NODE_DOMAIN: '/getNearestFreeExit',
  // 当前节点人数
  GET_CURRENT_NUMBER: '/getCurrentNumById',

  // other
  // 轮询间隔ms
  POLL_TIMEOUT: 1000,
};

// 卡片展示
class ShowCard extends Component {
  state = {
    // 当前节点id
    currentId: CONST.DEFAULT_ID,
    // 当前节点名称
    currentPosition: CONST.DEFAULT_POSITION,
    // 当前节点的人数
    currentNum: 0,
    // 下一节点id
    nextId: CONST.DEFAULT_ID,
    // 下一节点名称
    nextPosition: CONST.DEFAULT_POSITION,
  };

  componentDidMount() {
    // 获取当前节点人数, 轮询获取
    this.getCurrentNodeNumber();

    // 获取下一个节点
    this.getNextNode();
  }

  /**
   * render
   */
  render() {
    return (
      <View style={cardStyles.mainCard}>
        <View style={cardStyles.cardTop}>
          <View
            style={[
              cardStyles.topTextContainer,
              cardStyles.topTextLeftContainer,
            ]}>
            <Text style={[mainStyles.centerText, cardStyles.smallText]}>
              当前位置: {this.state.currentPosition}。
            </Text>
          </View>
          <View
            style={[
              cardStyles.topTextContainer,
              cardStyles.topTextRightContainer,
            ]}>
            <Text style={[mainStyles.centerText, cardStyles.smallText]}>
              目前有 {this.state.currentNum} 人在您附近。
            </Text>
          </View>
        </View>

        <View style={cardStyles.cardBottom}>
          <Text
            style={[
              mainStyles.centerText,
              cardStyles.middleText,
              cardStyles.tipMsg,
            ]}>
            请向 {this.state.nextPosition} 位置行进。
          </Text>
          <View style={cardStyles.cardBottomButtonContainer}>
            <Button
              onPress={this.moveToNextNode.bind(this)}
              title={'测试移动到下一区域'}
              style={cardStyles.bottomButton}
              color={'#008df8'}
            />
          </View>
        </View>
      </View>
    );
  }

  /**
   * 获取下一节点
   */
  getNextNode() {
    Axios.get(CONST.GATEWAY + CONST.GET_NEXT_NODE_DOMAIN, {
      params: {
        id: this.state.currentId,
      },
    })
      .then(resp => {
        let respData = resp.data;

        if (respData.nodeid === this.state.nextId) {
          // 到达尽头，重新选择节点
          this.genNewId();
        } else {
          this.setState({
            nextId: respData.nodeid,
            nextPosition: respData.nodeName,
          });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  /**
   * 得到当前节点的人数并更新
   */
  getCurrentNodeNumber() {
    let timer;
    Axios.get(CONST.GATEWAY + CONST.GET_CURRENT_NUMBER, {
      params: {
        id: this.state.currentId,
      },
    })
      .then(resp => {
        if (resp) {
          this.setState({
            currentNum: Number(resp.data),
          });

          timer = setTimeout(() => {
            this.getCurrentNodeNumber();
          }, CONST.POLL_TIMEOUT);
        } else {
          clearTimeout(timer);
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  /**
   * 重新生成id
   */
  async genNewId() {
    let randomId = Math.floor(((Math.random() * 0xffffff) % 80) + 1);

    console.log(randomId);

    await this.setState({
      currentId: randomId,
    });

    // 更新人数
    this.getCurrentNodeNumber();

    // 更新节点
    this.getNextNode();
  }

  /**
   * move to next node touch event
   */
  async moveToNextNode() {
    await this.setState({
      currentId: this.state.nextId,
      currentPosition: this.state.nextPosition,
    });

    // 更新人数
    this.getCurrentNodeNumber();

    // 更新节点
    this.getNextNode();
  }
}

// 中间卡片样式
const cardStyles = StyleSheet.create({
  mainCard: {
    flex: 1,
    backgroundColor: '#eeeeee',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 35,
    marginRight: 35,

    borderRadius: 10,
  },
  cardBottomButtonContainer: {
    flex: 1,
    width: 300,
    justifyContent: 'space-evenly',
    alignSelf: 'center',
    color: 'black',
  },
  cardTop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#eeeeee',
    borderRadius: 10,
  },
  topTextContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topTextLeftContainer: {
    borderTopLeftRadius: 10,
  },
  topTextRightContainer: {
    borderTopRightRadius: 10,
  },
  cardBottom: {
    flex: 2,
    justifyContent: 'space-evenly',
    margin: 10,
    borderRadius: 10,
  },
  smallText: {
    fontSize: 25,
    top: 20,
  },
  middleText: {
    fontSize: 30,
    top: 16,
  },
  tipMsg: {
    flex: 1,
  },
  bottomButton: {
    alignSelf: 'stretch',
    flex: 1,
    marginTop: 30,
  },
});

export default class PublicOverwatchApp extends Component {
  render() {
    return (
      <View style={mainStyles.mainContainer}>
        <ImageBackground
          style={mainStyles.backgroundLogo}
          source={require('./asserts/mylogo.png')}
        />
        <View style={mainStyles.mainTitle}>
          <View style={mainStyles.titleContainer}>
            <Text style={mainStyles.centerText}>Public Overwatch Edge</Text>
          </View>
        </View>
        <View style={mainStyles.mainBody}>
          <ShowCard />
        </View>
      </View>
    );
  }
}

// 全局样式
const mainStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },

  backgroundLogo: {
    position: 'absolute',
    height: 115,
    width: '100%',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  titleContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  mainTitle: {
    flex: 1,
  },
  mainBody: {
    flex: 3,
    backgroundColor: '#008df8',
  },
  centerText: {
    alignSelf: 'center',
    fontSize: 40,
    color: '#111',
  },
});
