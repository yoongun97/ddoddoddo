import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { userAtom } from "../../store/userAtom";
import Unloggined from "../../common/Unloggined";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebaseConfig";
import { useParams } from "react-router-dom";
import SavedList from "./components/SavedList";
import MyList from "./components/MyList";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useQuery } from "react-query";

function MyPage() {
  const [user] = useAtom(userAtom);
  const userUidObject = useParams();
  const userUid = userUidObject.uid;

  const [isMyListActived, setIsMyListActived] = useState(true);
  const [isEditorAcitved, setIsEditorActived] = useState(false);

  const [allData, setAllData] = useState([]);

  const [ownData, setOwnData] = useState([]);
  const [allLikedData, setAllLikedData] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  // 입력 받는 새로운 닉네임
  const [newNickname, setNewNickname] = useState(user?.displayName);

  const fetchData = async () => {
    // 유저 데이터

    const userQ = query(collection(db, "users"));
    const querySnapshot = await getDocs(userQ);
    const data = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setAllData(data);
    setOwnData(data.find((item) => item.uid === userUid));

    // 또가요 데이터
    const likedQ = query(collection(db, "likes"));
    const likedQuerySnapshot = await getDocs(likedQ);
    const likedData = likedQuerySnapshot.docs.map((doc) => doc.data());

    // 모든 좋아요 데이터 저장
    setAllLikedData(likedData);

    // 내 저장 데이터
    const savedQ = query(collection(db, "saved"), where("uid", "==", userUid));
    const savedQuerySnapshot = await getDocs(savedQ);
    const savedData = savedQuerySnapshot.docs.map((doc) => doc.data());

    // 모든 글 데이터
    const postsQ = query(collection(db, "posts"));
    const postsQuerySnapshot = await getDocs(postsQ);
    const postsData = postsQuerySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // 내가 쓴 글 목록 저장
    setMyPosts(postsData.filter((data) => data.uid === userUid));

    // 저장한 글 목록 저장
    const filteredData = postsData.filter((post) => {
      return savedData.some((data) => post.id === data.postId);
    });
    setSavedPosts(filteredData);
  };

  // 처음 랜더링 될 때 likes / posts db에서 user의 uid와 동일한 uid 가 있는 것들만 정보 가져옴
  useEffect(() => {
    fetchData();
  }, []);

  // 버튼 클릭 시 리스트 전환 함수
  const activeSavedListHandler = () => {
    setIsMyListActived(false);
  };
  const activeMyListHandler = () => {
    setIsMyListActived(true);
  };

  // 프로필 사진 업로드 및 변경 핸들러
  const uploadPhotoHandler = (e) => {
    try {
      const image = e.target.files[0];
      const imageRef = ref(storage, `ProfileImages/${image.name}`);
      uploadBytes(imageRef, image).then(() => {
        getDownloadURL(imageRef).then(async (url) => {
          await updateProfile(auth.currentUser, {
            photoURL: url,
          });
          fetchData();
          alert("프로필 수정 완료!");
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 닉네임 수정 버튼 클릭 핸들러
  const startEditNameHandler = () => {
    setIsEditorActived(true);
  };

  // 닉네임 중복 검사 및 수정 완료 핸들러
  const endEditNameHandler = async () => {
    try {
      const usedNickname = allData.filter(
        (item) => item.nickname === newNickname
      );
      if (!!newNickname === false) {
        return alert("닉네임을 입력해 주세요");
      } else if (usedNickname.length > 0) {
        return alert(
          "이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해 주세요."
        );
      } else if (usedNickname.length === 0) {
        setIsEditorActived(false);

        // 1. firebase auth 정보 업데이트
        updateProfile(auth.currentUser, {
          displayName: newNickname,
        });
        // 2. firestore users db 정보 업데이트
        const userRef = doc(db, "users", `${ownData.id}`);
        await updateDoc(userRef, { nickname: newNickname });

        fetchData();

        return alert("닉네임 수정 완료!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 리액트 쿼리로 로딩/에러 처리

  const { isLoading, iserror, error } = useQuery("userData", fetchData);

  if (isLoading) {
    return <div>로딩 중입니다...</div>;
  }

  if (iserror) {
    return alert(`에러 발생! Error Code: ${error.message}`);
  }

  return (
    <div>
      {user ? (
        <div className="MypageContainer">
          <div className="UserInfoInner">
            <p>마이페이지</p>
            <div>
              <div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="프로필 이미지" width="100px" />
                ) : (
                  <img src="" alt="프로필 이미지 미등록" />
                )}
                <div>
                  <input
                    type="file"
                    onChange={(e) => uploadPhotoHandler(e)}
                  ></input>
                  <span>파일버튼</span>
                  {/* 추후 input display:none하고 span 태그로 버튼 모양 만들기 */}
                </div>
              </div>
              <div>
                {/* SNS 이용자는 닉네임 못 바꾸게 함 */}
                {ownData === undefined ? (
                  <div>
                    <input type="text" value={user.displayName} disabled />
                    <p>SNS 로그인 사용 시 닉네임을 수정할 수 없습니다.</p>
                  </div>
                ) : (
                  <div>
                    {/* 닉네임 인풋 */}
                    {isEditorAcitved ? (
                      <input
                        type="text"
                        value={newNickname}
                        onChange={(e) => {
                          setNewNickname(e.target.value);
                        }}
                      />
                    ) : (
                      <input type="text" value={user.displayName} disabled />
                    )}
                    {/* 닉네임 수정 버튼 */}
                    {isEditorAcitved ? (
                      <button
                        onClick={() => {
                          endEditNameHandler();
                        }}
                      >
                        완료
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          startEditNameHandler();
                        }}
                      >
                        수정
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="ListContainer">
            <div>
              {/* 내가 쓴 글/ 저장한 글 전환 */}
              <span onClick={activeMyListHandler}>내가쓴글</span>
              <span onClick={activeSavedListHandler}>저장한글</span>
            </div>
            <div className="ListContainerInner">
              {/* 버튼 전환 시 리스트 전환 */}
              {isMyListActived === true ? (
                <MyList myPosts={myPosts} allLikedData={allLikedData} />
              ) : (
                <SavedList
                  savedPosts={savedPosts}
                  allLikedData={allLikedData}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        // 비회원일 경우에 Unloggined 컴포넌트 보여 주기
        <Unloggined />
      )}
    </div>
  );
}

export default MyPage;
