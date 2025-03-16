import change_ootd, embedding_match, input_analyse


# 使用预加载的模型和tokenizer
def styleAi(user_input_url, db_url, tokenizer, model, device):
    # Step 1: Analyze user input
    user_text = input_analyse.main(user_input_url)
    # Step 2: Matching embedding
    best_image_name = embedding_match.main(user_text, tokenizer, model, device)
    model_image_url = db_url + best_image_name
    # Step 3: Change OOTD
    output_path = change_ootd.main(user_input_url, model_image_url)

    return output_path