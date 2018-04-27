import { notification, Icon } from 'antd';
import {
  getProblemInfo,
  commonSubmit,
  testSubmit,
  getCode,
  saveCode,
  getCommonResult,
  getTestResult,
  queryCollection,
} from '../services/api';


export default {
  namespace: 'problem',

  state: {
    problemInfo: {}, // 题目详情
    testResult: {}, // 测试提交结果
    commonResult: {}, // 普通提交结果
    isSuccess: 1, // 提交代码是否成功
    code: '', // 本题的提交代码
    language: '',
    collection: {
      isSuccess: false,
      flag: '',
    },
    loading: true,
    error: '',
  },

  effects: {
    *fetchProblemInfo({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getProblemInfo, payload);
      if (response.code === 0) {
        yield put({
          type: 'saveProblemInfo',
          payload: response.data,
        });
      } else {
        yield put({
          type: 'saveProblemInfo',
          payload: {
            error: '服务器错误！',
          },
        });
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },

    *fetchCode ({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getCode, payload);

      if (response.code === 0) {
        yield put({
          type: 'getCode',
          payload: response.data,
        });
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },

    // 测试提交
    *testSubmitCode({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response1 = yield call(testSubmit, payload); // 提交代码
      if (response1.code === 0) {
        const params = {
          submit_id: response1.data.submit_id,
        };
        let response2 = yield call(getTestResult, params); // 获得测评结果
        if (response2.code === 0) {
          yield put({
            type: 'saveTestResult',
            payload: response2.data,
          });
          let { status } = response2.data;
          while (status !== 0) {
            console.log(params);
            response2 = yield call(getTestResult, params);
            if (response2.code === 0) {
              status = response2.data.status;
              yield put({
                type: 'saveTestResult',
                payload: response2.data,
              });
            }
          }
        }
      } else {
        yield put({
          type: 'submitCode',
          payload: 0,
        });
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },

    // 普通提交
    *commonSubmitCode ({ payload }, { call, put }){
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response1 = yield call(commonSubmit, payload); // 提交代码
      if (response1.code === 0) {
        const params = {
          submit_id: response1.data.submit_id,
        }
        let response2 = yield call(getCommonResult, params); // 获得测评结果
        if (response2.code === 0) {
          yield put({
            type: 'saveCommonResult',
            payload: response2.data,
          });
          let { status } = response2.data;
          while (status !== 0) {
            response2 = yield call(getCommonResult, params);
            if (response2.code === 0) {
              status = response2.data.status;
              yield put({
                type: 'saveCommonResult',
                payload: response2.data,
              });
            }
          }
        }
      } else {
        yield put({
          type: 'submitCode',
          payload: 0,
        });
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },

    // 保存代码
    *saveCode({ payload }, { call }) {
      const response = yield call(saveCode, payload);
      if (response.code === 0) {
        notification.success({
          message: '保存代码提示',
          description: '保存成功',
          icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />,
          duration: 2,
        });
      } else {
        notification.error({
          message: '保存代码提示',
          description: '保存成功',
          icon: <Icon type="frown-o" style={{ color: '#108ee9' }} />,
          duration: 2,
        });
      }
    },

    // 收藏题目
    *collection({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(queryCollection, payload);
      if (response && response.code === 0) {
        yield put({
          type: 'saveCollection',
          payload: response.data,
        });
      } else {
        yield put({
          type: 'saveCollection',
          payload: {
            error: '服务器错误',
            loading: false,
          },
        });
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
  },

  reducers: {
    saveProblemInfo(state, action) {
      return {
        ...state,
        problemInfo: action.payload,
      };
    },

    getCode(state, action) {
      return {
        ...state,
        code: action.payload.code,
        language: action.payload.language,
      };
    },

    submitCode (state, action) {
      return {
        ...state,
        isSuccess: action.payload,
      };
    },

    saveCommonResult(state, action) {
      return {
        ...state,
        commonResult: action.payload,
      };
    },

    saveTestResult(state, action) {
      return {
        ...state,
        testResult: action.payload,
      };
    },

    saveCollection(state, action) {
      return {
        ...state,
        collection: {
          isSuccess: action.payload,
          flag: true,
        },
      };
    },

    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
  },
};
