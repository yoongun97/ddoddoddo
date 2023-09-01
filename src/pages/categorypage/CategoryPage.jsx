import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import PageNation from "../../components/pageNation/PageNation";
import CategoryLikes from "./CategoryLikes";
import { useAtom } from "jotai";
import { userAtom } from "../../store/userAtom";
import { styled } from "styled-components";
import Search from "../../components/search/Search";
import TopButton from "../../common/TopButton";

function CategoryPage() {
  const [user] = useAtom(userAtom);
  const { nation, category } = useParams();
  const [filteredPosts, setFilteredPosts] = useState([]);
  //페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  // const postsViewPage = 3; // 한 페이지에 보여줄 게시물 수
  const postsViewPage = 3; // 한 페이지에 보여줄 게시물 수
  //또가요 , 북마크 , 최신순 정렬하기

  const [sortOption, setSortOption] = useState("date");

  const handleSortOption = (newSortOption) => {
    setSortOption(newSortOption);
  };

  const handleSearch = (searchData) => {
    const searchResults = posts.filter((post) => {
      const totalSearchData = searchData.toLowerCase().replace(" ", "");

      const placeNameMatch = post.placeName
        .replace(" ", "")
        .toLowerCase()
        .includes(totalSearchData);

      const placeLocationMatch = post.placeLocation
        .replace(" ", "")
        .toLowerCase()
        .includes(totalSearchData);

      return placeNameMatch || placeLocationMatch;
    });
    console.log({ searchResults, searchData });
    setFilteredPosts(searchResults);
    setCurrentPage(1);
  };

  const fetchPosts = async () => {
    const postsCollection = query(
      collection(db, "posts"),
      where("nation", "==", nation),
      where("category", "==", category)
    );

    const querySnapshot = await getDocs(postsCollection);

    // const postsData = [];
    // querySnapshot.forEach((doc) => {
    //   postsData.push({
    //     ...doc.data(),
    //     id: doc.id,
    //   });
    // });

    // const sortedPosts = sortPosts(postsData);

    // return sortedPosts;

    const postsData = [];
    //for of로 바꾸어서 비동기 처리하기
    for (const doc of querySnapshot.docs) {
      const post = {
        ...doc.data(),
        id: doc.id,
      };
      //likes의 정보를 가져옴
      const likesSnapshot = await getDocs(
        query(collection(db, "likes"), where("postId", "==", post.id))
      );

      post.likes = likesSnapshot.size;
      postsData.push(post);
    }

    const sortedPosts = sortPosts(postsData);

    return sortedPosts;
  };
  //또가요 , 북마크 , 최신순 정렬하기
  const sortPosts = (posts) => {
    if (sortOption === "likes") {
      // likes 내림차순 정렬, 같은 likes는 최신순으로 정렬
      return posts.sort((a, b) => {
        if (b.likes === a.likes) {
          return b.date - a.date; // 최신순으로 정렬
        }
        return b.likes - a.likes;
      });
    } else if (sortOption === "date") {
      return posts.sort((a, b) => b.date - a.date);
    }
    return posts;
  };

  const {
    data: posts,
    error,
    isLoading,
  } = useQuery(["posts", category], fetchPosts);
  // undefined
  // 데이터를 가져오는게 완료돠면 posts에 데이터가 들어감

  // //새로운 훅을 만들어 likes를 가져오기
  // useEffect(() => {
  //   const fetchPostsAndLikes = async () => {
  //     const postsWithLikes = await fetchPosts();
  //     setFilteredPosts(postsWithLikes);
  //   };

  //   fetchPostsAndLikes();
  // }, [sortOption, currentPage]);

  // 첫 데이터 세팅을 위해 useEffect 실행
  // useEffect(() => {
  //   const indexOfLastPost = currentPage * postsViewPage;
  //   const indexOfFirstPost = indexOfLastPost - postsViewPage;
  //   console.log({ indexOfFirstPost, indexOfLastPost });
  //   // posts가 처음엔 useQuery로 가져오는데 시간이 걸리기 때문에 ? 옴셔널 체이닝 걸어줌
  //   const currentPosts = posts?.slice(indexOfFirstPost, indexOfLastPost);
  //   console.log({ posts, currentPosts });
  //   // 옵셔널 체이닝 걸어줄 때, currentPosts가 undefined이기 때문에 setFilteredPosts에 [] 빈 배열이 들어가도록 설정
  //   // posts가 다 가져와지면 currentPosts가 다시 들어감
  //   setFilteredPosts(currentPosts || []);
  //   //추가 부분 sortPosts 함수 사용해서 currentPosts를 사용 후 filteredPosts로 정렬
  //   const sortedPosts = sortPosts(currentPosts);
  //   setFilteredPosts(sortedPosts);
  // }, [posts, sortOption, currentPage]);
  // useEffect(() => { 여기가 동작한다 => 화면에 보이는 filteredPosts를 수정한다. } , [이게 바뀌면 => sortOption이 바뀌면])

  useEffect(() => {
    if (posts && posts.length > 0) {
      const indexOfLastPost = currentPage * postsViewPage;
      const indexOfFirstPost = indexOfLastPost - postsViewPage;
      const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
      const sortedPosts = sortPosts(currentPosts);
      setFilteredPosts(sortedPosts);
    }
  }, [posts, sortOption, currentPage]);

  if (error) {
    console.error("데이터를 가져올 수 없습니다", error);
    return alert("데이터를 가져올 수 없습니다");
  }

  if (isLoading) {
    return "정보를 가져오고 있습니다.";
  }
  //페이지 네이션

  return (
    <CategoryPageContainer>
      <PhrasesContainer>
        <h2>{category}</h2>
        <h3>우리 동네 베스트 추천 장소</h3>
        <Search onSearch={handleSearch} />
      </PhrasesContainer>
      <MiddleContainer>
        <FilterContainer>
          {sortOption === "date" ? (
            <OnButton onClick={() => handleSortOption("date")}>
              <img
                src={`${process.env.PUBLIC_URL}/icon/latest_icon_white.svg`}
                alt="latest_Filter_Icon"
              ></img>
              <span>최신순</span>
            </OnButton>
          ) : (
            <OffButton onClick={() => handleSortOption("date")}>
              <img
                src={`${process.env.PUBLIC_URL}/icon/latest_icon_gray.svg`}
                alt="latest_Filter_Icon"
              ></img>
              <span>최신순</span>
            </OffButton>
          )}
          {sortOption === "likes" ? (
            <OnButton onClick={() => handleSortOption("likes")}>
              <img
                src={`${process.env.PUBLIC_URL}/icon/liked_icon_white.svg`}
                alt="liked_Filter_Icon"
              ></img>
              <span>인기순</span>
            </OnButton>
          ) : (
            <OffButton onClick={() => handleSortOption("likes")}>
              <img
                src={`${process.env.PUBLIC_URL}/icon/liked_icon_gray.svg`}
                alt="liked_Filter_Icon"
              ></img>
              <span>인기순</span>
            </OffButton>
          )}
        </FilterContainer>
        {!!user ? (
          <WriteButton to={`/create`}>
            <img
              src={`${process.env.PUBLIC_URL}/icon/write_icon_white.svg`}
              alt="writing_icon"
            ></img>
            <span>글쓰기</span>
          </WriteButton>
        ) : (
          <></>
        )}
      </MiddleContainer>
      {/* //수정 */}
      <PostsContainer>
        {filteredPosts.length > 0 ? (
          filteredPosts
            .slice(0, 10) // 빈 문자열 조회시 갯수 상관없이 보여줘서 3개로 우선 자르기
            .map((post) => (
              <div key={post.id}>
                <PostBox to={`/detail/${post.id}`}>
                  <ImageBox alt="PostImgs" src={post.postImgs} />
                  <h4>{post.placeName}</h4>
                  <h5>{post.placeLocation}</h5>
                  <p>
                    <span># </span>
                    {post.postOneLineContent}
                  </p>
                  <CategoryLikes id={post.id} />
                </PostBox>
              </div>
            ))
        ) : (
          <div>결과가 없습니다.</div>
        )}
      </PostsContainer>
      <TopButton />
      <PageNation
        postsViewPage={postsViewPage}
        totalPosts={posts.length}
        currentPage={currentPage}
        pagenate={setCurrentPage} // 현재 페이지 업데이트 함수 전달
      />
    </CategoryPageContainer>
  );
}

export default CategoryPage;

const CategoryPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 1280px;
  margin: 180px auto 140px;
  text-align: center;
`;

const PhrasesContainer = styled.div`
  margin: 0 auto;

  & > h2 {
    font-size: 28px;
    font-weight: 600;
  }

  & > h3 {
    margin: 20px 0 60px;
    font-size: 24px;
    font-weight: 500;
    color: #222;
  }
`;
const MiddleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 30px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;

  & > button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    width: 105px;
    height: 34px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 400;
  }
`;
const OnButton = styled.button`
  border: 1px solid #0a58be;
  background-color: #0a58be;
  color: #fff;
`;
const OffButton = styled.button`
  border: 1px solid #e5e5e5;
  background-color: #fff;
  color: #bfbfbf;
`;
const WriteButton = styled(Link)`
  align-self: flex-end;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  width: 100px;
  height: 40px;
  border-radius: 8px;
  background-color: #0a58be;
  color: #fff;
  text-align: center;
`;

const PostsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 70px;
  row-gap: 80px;
  width: 1280px;
`;
const PostBox = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 380px;
  text-align: left;

  & > h4 {
    margin-top: 20px;
    font-size: 20px;
    font-weight: 500;
    line-height: 26px;
    color: #222;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > h5 {
    width: 100%;
    padding: 5px 0;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > p {
    padding-bottom: 8px;
    font-size: 14px;
    font-weight: 300;
    line-height: 26px;
    color: #777;
  }
`;

const ImageBox = styled.img`
  width: 380px;
  height: 380px;
  object-fit: cover;
`;
