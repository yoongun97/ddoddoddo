import React from 'react';
import PlaceMap from '../../components/place/PlaceMap';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import Likes from '../../components/likes/Likes';
import Bookmark from '../../components/bookmark/Bookmark';
import ImageSlide from '../../components/ImageSlide';
import Comments from '../../components/comments/Comments';

function DetailPage() {
  const { id } = useParams();

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery('post', async () => {
    const postRef = doc(db, 'posts', id);
    const docSnapshot = await getDoc(postRef);

    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() };
    } else {
      throw new Error('해당 ID의 데이터를 찾을 수 없습니다.');
    }
  });

  if (isLoading) {
    return <div>데이터 가져오는 중...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '0 auto 0 auto',
        }}
      >
        <h2>{post?.placeName}</h2>
        <button style={{ margin: ' 20px 5% 20px auto' }}>공유하기</button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0 auto 0 auto',
          }}
        >
          <div style={{ display: 'flex', marginLeft: 'auto' }}>
            <button>수정</button>
            <button>삭제</button>
          </div>
          {/* <ImageSlide /> */}
          <img
            style={{
              width: '400px',
              height: '400px',
            }}
            src="https://cdn.pixabay.com/photo/2023/08/02/14/25/dog-8165447_640.jpg"
            alt="디테일 이미지"
          />
          <p>{post?.postContent}</p>
          <PlaceMap postAddress={post?.placeLocation} />
        </div>
        <div>
          <Bookmark />
          <Likes />
        </div>
        {/* 댓글창 */}
        <Comments id={id} />
      </div>
    </>
  );
}

export default DetailPage;
