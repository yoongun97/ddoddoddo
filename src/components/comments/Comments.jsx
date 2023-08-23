import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { auth, db } from "../../firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

function Comments({ id }) {
  const queryClient = useQueryClient();

  const [comment, setComment] = useState("");

  const [, setComments] = useState([]);
  const currentUser = auth.currentUser;

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery("post", async () => {
    const postRef = doc(db, "posts", id);
    const docSnapshot = await getDoc(postRef);
    //firebase 에서 댓글 불러오기
    if (docSnapshot.exists()) {
      const commentsRef = query(
        collection(db, "comments"),
        where("postId", "==", id)
      );
      const commentsSnapshot = await getDocs(commentsRef);
      const commentsData = [];
      commentsSnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });

      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        comments: commentsData,
        //firebase 에서 댓글 불러오기
      };
    } else {
      throw new Error("해당 ID의 데이터를 찾을 수 없습니다.");
    }
  });

  if (isLoading) {
    return <div>데이터 가져오는 중...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  //댓글 등록
  const commentChange = (e) => setComment(e.target.value);

  const commentSubmit = async (e) => {
    e.preventDefault();
    if (comment === "") {
      return;
    }

    try {
      const newComment = {
        comment: comment,
        postId: id,
        userId: currentUser.uid,
        author: currentUser.displayName,
      };
      const docRef = await addDoc(collection(db, "comments"), newComment);
      setComments([...post.comments, { id: docRef.id, ...newComment }]);
      setComment("");
      queryClient.invalidateQueries("post");
    } catch (error) {
      console.error("댓글 추가 에러: ", error);
    }
  };

  //댓글삭제
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, "comments", commentId));
      setComments(post.comments.filter((comment) => comment.id !== commentId));
      queryClient.invalidateQueries("post");
    } catch (error) {
      console.error("댓글 삭제 에러: ", error);
    }
  };

  return (
    <span
      style={{ width: "800px", height: "300px", border: "1px solid black" }}
    >
      <form onSubmit={commentSubmit}>
        <textarea
          type="text"
          placeholder="댓글을 입력해주세요"
          value={comment}
          onChange={commentChange}
        />
        <input type="submit" value="등록" />
      </form>
      <div>
        {post.comments?.map((comment) => (
          <div key={comment.id}>
            <div>
              {comment.author}
              <div>{comment.comment}</div>
            </div>
            {currentUser && comment.userId === currentUser.uid && (
              <button onClick={() => handleDeleteComment(comment.id)}>
                삭제
              </button>
            )}
          </div>
        ))}
      </div>
    </span>
  );
}

export default Comments;
